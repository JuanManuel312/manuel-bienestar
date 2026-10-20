import {guideAvailable,openGuide,diagnoseGuide} from '../lib/guide.js';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {PublicError,settings,sign,verify,cookies,cookie,sameOrigin,validCapture,stillPaid,paypalClient,newReference} from '../lib/paypal.js';

export function makeHandler({env=process.env,fetcher=fetch}={}){return async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('Vercel-CDN-Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 const cfg=settings(env),url=new URL(req.url,'https://local.invalid'),action=url.searchParams.get('action');
 const methods={config:'GET',checkout:'POST',capture:'POST',access:'GET',restore:'POST',download:'GET'};
 const send=(status,data)=>res.status(status).json(data);
 try{
  if(!methods[action])return send(404,{error:'Ruta no encontrada.'});
  if(req.method!==methods[action]){res.setHeader('Allow',methods[action]);return send(405,{error:'Método no permitido.'});}
  if(action==='config'){
   // Only fixed codes and booleans: never return credentials, URLs or upstream bodies.
   const checks={
    salesEnabled:cfg.enabled,
    siteUrlValid:Boolean(cfg.origin),
    paypalClientIdPresent:Boolean(cfg.client),
    paypalSecretPresent:Boolean(cfg.secret),
    accessSecretValid:Boolean(cfg.key&&cfg.key.length>=48)
   };
   const pdf=cfg.testAllowed?{ok:true,code:'PDF_NOT_REQUIRED_IN_SANDBOX'}:await diagnoseGuide(env,fetcher);
   const blockers=[];
   if(!checks.salesEnabled)blockers.push('SALES_DISABLED');
   if(!checks.siteUrlValid)blockers.push('SITE_URL_INVALID');
   if(!checks.paypalClientIdPresent)blockers.push('PAYPAL_CLIENT_ID_MISSING');
   if(!checks.paypalSecretPresent)blockers.push('PAYPAL_CLIENT_SECRET_MISSING');
   if(!checks.accessSecretValid)blockers.push('ACCESS_TOKEN_SECRET_MISSING_OR_SHORT');
   if(!pdf.ok)blockers.push(pdf.code);
   return send(200,{version:'diagnostic-2026-10-20',ready:cfg.configured&&cfg.enabled&&pdf.ok,mode:cfg.mode,checks,pdf,blockers,paypalCredentialsVerified:false});
  }
  if(!cfg.configured)throw new PublicError(503,'Estamos configurando los pagos. Aún no se realizan cobros.');
  if(req.method==='POST')sameOrigin(req,cfg);
  const jar=cookies(req),api=paypalClient(cfg,fetcher);
  const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  async function checkAccess(ticket){
   if(!ticket||!ticket.capture||!ticket.order)throw new PublicError(401,'Usa tu enlace personal o vuelve a comprobar tu compra en este navegador.');
   const capture=await api('/v2/payments/captures/'+encodeURIComponent(ticket.capture));
   if(!stillPaid(capture,ticket.capture))throw new PublicError(403,'Este pago no está confirmado o ha sido reembolsado.');
   return capture;
  }
  if(action==='checkout'){
   if(!cfg.enabled||(!cfg.testAllowed&&!await guideAvailable(env,fetcher)))throw new PublicError(503,'Las compras aún no están habilitadas.');
   if(body.acceptPurchase!==true)throw new PublicError(400,'Confirma la compra de la guía.');
   const existing=verify(jar['__Host-access'],cfg,'access');
   if(existing){await checkAccess(existing);return send(200,{url:'/mi-guia'});}
   const pending=verify(jar['__Host-checkout'],cfg,'checkout');
   if(pending)return send(200,{url:'/pago?token='+encodeURIComponent(pending.order)});
   const reference=newReference();
   const order=await api('/v2/checkout/orders','POST',{intent:'CAPTURE',purchase_units:[{custom_id:reference,description:'Adiós al Metabolismo Lento: Adelgaza sin Dietas',amount:{currency_code:'USD',value:'9.90'}}],payment_source:{paypal:{experience_context:{brand_name:'Manuel Santos',shipping_preference:'NO_SHIPPING',user_action:'PAY_NOW',return_url:cfg.origin+'/pago',cancel_url:cfg.origin+'/pago?cancelado=1'}}}},reference);
   const link=order.links?.find(v=>v.rel==='payer-action'||v.rel==='approve')?.href;
   let approval;try{approval=new URL(link);}catch{throw new PublicError(502,'PayPal no devolvió un enlace de pago válido.');}
   if(approval.protocol!=='https:'||approval.hostname!==(cfg.mode==='live'?'www.paypal.com':'www.sandbox.paypal.com')||!/^[A-Z0-9]+$/.test(order.id))throw new PublicError(502,'No se pudo iniciar el pago.');
   res.setHeader('Set-Cookie',cookie('__Host-checkout',sign({kind:'checkout',order:order.id,reference,approval:approval.href},cfg,86400*3),86400*3));
   return send(200,{url:approval.href});
  }
  if(action==='capture'){
   const expected=verify(jar['__Host-checkout'],cfg,'checkout');
   if(!expected||body.orderId&&body.orderId!==expected.order)throw new PublicError(401,'Abre este enlace en el navegador donde iniciaste la compra.');
   let order=await api('/v2/checkout/orders/'+encodeURIComponent(expected.order));
   if(order.status==='CREATED'||order.status==='PAYER_ACTION_REQUIRED')return send(200,{approval:expected.approval,pending:true});
   if(order.status==='APPROVED'){
    try{await api('/v2/checkout/orders/'+encodeURIComponent(expected.order)+'/capture','POST',{},'capture-'+expected.reference);}catch(error){if(!error.paypalStatus)throw error;}
    // Re-read on every retry, including a timeout after PayPal has charged the buyer.
    order=await api('/v2/checkout/orders/'+encodeURIComponent(expected.order));
   }
   const paid=validCapture(order,expected);if(!paid)throw new PublicError(409,'El pago todavía no está confirmado. Espera un momento y vuelve a comprobarlo.');
   const ticket={kind:'access',order:expected.order,capture:paid.id};await checkAccess(ticket);
   res.setHeader('Set-Cookie',cookie('__Host-access',sign(ticket,cfg,86400*365),86400*365));
   return send(200,{url:'/mi-guia'});
  }
  if(action==='restore'){
   const ticket=verify(body.token,cfg,'recovery');await checkAccess(ticket);
   res.setHeader('Set-Cookie',cookie('__Host-access',sign({kind:'access',order:ticket.order,capture:ticket.capture},cfg,86400*365),86400*365));
   return send(200,{ok:true});
  }
  if(action==='download'){
   const ticket=verify(jar['__Host-access'],cfg,'access');await checkAccess(ticket);
   const file=await openGuide(env,fetcher);
   res.setHeader('Content-Type','application/pdf');
   res.setHeader('Content-Disposition','attachment; filename="Adios-al-Metabolismo-Lento.pdf"');
   res.status(200);await pipeline(Readable.fromWeb(file.body),res);return;
  }
  if(action==='access'){
   const ticket=verify(jar['__Host-access'],cfg,'access');await checkAccess(ticket);
   const recovery=sign({kind:'recovery',order:ticket.order,capture:ticket.capture},cfg,86400*365*10);
   // Protected content is generated only after server-side payment verification.
   return send(200,{title:'Tu acceso está confirmado.',content:'Tu pago ha sido verificado. Aquí tienes tu espacio para volver a la guía cuando lo necesites.',downloadReady:await guideAvailable(env,fetcher),order:ticket.order,mode:cfg.mode,recovery:cfg.origin+'/mi-guia#access='+recovery});
  }
 }catch(error){if(res.headersSent){res.destroy();return;}return send(error instanceof PublicError?error.status:503,{error:error instanceof PublicError?error.message:'No pudimos completar la comprobación. Inténtalo otra vez en unos minutos.'});}
};}
export default makeHandler();
