import {createHmac, timingSafeEqual, randomUUID} from 'node:crypto';

export class PublicError extends Error { constructor(status,message){super(message);this.status=status;} }
export function settings(env=process.env){
 const mode=env.PAYPAL_MODE==='live'?'live':'sandbox';
 let origin='';try {const u=new URL(env.SITE_URL);if(u.protocol==='https:'&&!u.username&&!u.password)origin=u.origin;}catch{}
 return {mode,origin,client:env.PAYPAL_CLIENT_ID,secret:env.PAYPAL_CLIENT_SECRET,key:env.ACCESS_TOKEN_SECRET,
  enabled:env.SALES_ENABLED==='true',
  configured:Boolean(origin&&env.PAYPAL_CLIENT_ID&&env.PAYPAL_CLIENT_SECRET&&env.ACCESS_TOKEN_SECRET?.length>=48),
  testAllowed:mode==='sandbox'};

}
export function sign(data,cfg,ttl=3600){
 if(!cfg.key||cfg.key.length<48)throw new PublicError(503,'El acceso aún no está configurado.');
 const payload=Buffer.from(JSON.stringify({...data,mode:cfg.mode,exp:Math.floor(Date.now()/1000)+ttl})).toString('base64url');
 return payload+'.'+createHmac('sha256',cfg.key).update(payload).digest('base64url');
}
export function verify(token,cfg,kind){
 if(typeof token!=='string'||token.length>3000||!cfg.key)return null;
 try{const [payload,signature,...extra]=token.split('.');if(extra.length||!signature)return null;
  const expected=createHmac('sha256',cfg.key).update(payload).digest();const received=Buffer.from(signature,'base64url');
  if(expected.length!==received.length||!timingSafeEqual(expected,received))return null;
  const data=JSON.parse(Buffer.from(payload,'base64url').toString());
  return data.kind===kind&&data.mode===cfg.mode&&Number.isFinite(data.exp)&&data.exp>Date.now()/1000?data:null;
 }catch{return null;}
}
export function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim().split(/=(.*)/s)).filter(v=>v[0]));}
export function cookie(name,value,age){return `${name}=${value}; Path=/; Max-Age=${age}; HttpOnly; Secure; SameSite=Lax`;}
export function sameOrigin(req,cfg){if(req.headers.origin!==cfg.origin)throw new PublicError(403,'Abre el proceso de pago desde nuestra página.');}
export function validCapture(order,expected){
 const units=order?.purchase_units;
 if(order?.id!==expected.order||order.status!=='COMPLETED'||units?.length!==1)return null;
 const unit=units[0],captures=unit.payments?.captures;
 if(unit.custom_id!==expected.reference||unit.amount?.currency_code!=='USD'||unit.amount?.value!=='9.90'||captures?.length!==1)return null;
 const c=captures[0];
 return c.status==='COMPLETED'&&c.final_capture===true&&c.amount?.currency_code==='USD'&&c.amount?.value==='9.90'&&/^[A-Z0-9]+$/.test(c.id)?c:null;
}
export function stillPaid(c,id){return c?.id===id&&c.status==='COMPLETED'&&c.amount?.currency_code==='USD'&&c.amount?.value==='9.90';}
export function paypalClient(cfg,fetcher=fetch){
 let tokenPromise;
 const base=cfg.mode==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';
 async function token(){
  const r=await fetcher(base+'/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(cfg.client+':'+cfg.secret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials',signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw new PublicError(503,'No pudimos conectar con PayPal. Inténtalo en unos minutos.');
  const d=await r.json();if(!d.access_token)throw new PublicError(503,'PayPal no está disponible.');return d.access_token;
 }
 return async(path,method='GET',body,key)=>{
  tokenPromise??=token();const bearer=await tokenPromise;
  const r=await fetcher(base+path,{method,headers:{Authorization:'Bearer '+bearer,'Content-Type':'application/json',Prefer:'return=representation',...(key?{'PayPal-Request-Id':key}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});
  if(!r.ok){const error=new PublicError(r.status===404?409:502,'PayPal no pudo confirmar esta operación. Puedes volver a comprobarla sin iniciar otra compra.');error.paypalStatus=r.status;throw error;}return r.json();
 };
}
export function newReference(){return randomUUID();}
