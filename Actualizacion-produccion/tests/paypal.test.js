import {Writable} from 'node:stream';
import {guideAvailable} from '../lib/guide.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {settings,sign,verify,validCapture,cookie} from '../lib/paypal.js';
import {makeHandler} from '../api/shop.js';
const env={PAYPAL_MODE:'sandbox',SITE_URL:'https://manuel-bienestar.vercel.app',PAYPAL_CLIENT_ID:'test-client',PAYPAL_CLIENT_SECRET:'test-secret',ACCESS_TOKEN_SECRET:'x'.repeat(64),SALES_ENABLED:'true'};
const cfg=settings(env);
const expected={kind:'checkout',order:'ORDER123',reference:'unique-ref',approval:'https://www.sandbox.paypal.com/checkoutnow?token=ORDER123'};
const capture={id:'CAPTURE123',status:'COMPLETED',final_capture:true,amount:{currency_code:'USD',value:'9.90'}};
const order={id:'ORDER123',status:'COMPLETED',purchase_units:[{custom_id:'unique-ref',amount:{currency_code:'USD',value:'9.90'},payments:{captures:[capture]}}]};
function mockFetch(options={}){const calls=[];const fn=async(url,init)=>{calls.push({url,init});let data;if(url.endsWith('/v1/oauth2/token'))data={access_token:'mock-oauth'};else if(url.includes('/v2/payments/captures/'))data={...capture,status:options.refunded?'REFUNDED':'COMPLETED'};else if(url.endsWith('/capture'))data=order;else if(url.endsWith('/ORDER123'))data=options.order||order;else if(url.endsWith('/v2/checkout/orders'))data={id:'NEW123',links:[{rel:'payer-action',href:'https://www.sandbox.paypal.com/checkoutnow?token=NEW123'}]};else throw Error('Unexpected URL '+url);return {ok:true,json:async()=>data};};fn.calls=calls;return fn;}
async function run(action,{method,body,jar='',environment=env,fetcher=mockFetch(),origin=cfg.origin}={}){const req={url:'/api/shop?action='+action,method:method||(action==='config'||action==='access'||action==='download'?'GET':'POST'),headers:{origin,cookie:jar},body};const chunks=[];const res=Object.assign(new Writable({write(chunk,encoding,callback){chunks.push(chunk);callback();}}),{headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.code=code;return this},json(data){this.data=data;return this}});await makeHandler({env:environment,fetcher})(req,res);res.bytes=Buffer.concat(chunks);return res;}
const checkoutCookie='__Host-checkout='+sign(expected,cfg,3600);
test('signed tokens reject tampering, expiry, wrong purpose and environment',()=>{const t=sign({kind:'access',capture:'C'},cfg);assert(verify(t,cfg,'access'));assert.equal(verify(t.slice(0,-8)+'abcdefgh',cfg,'access'),null);assert.equal(verify(t,cfg,'checkout'),null);assert.equal(verify(t,{...cfg,mode:'live'},'access'),null);assert.equal(verify(sign({kind:'access'},cfg,-1),cfg,'access'),null);});
test('only correct completed capture, amount, currency and order unlock',()=>{assert(validCapture(order,expected));for(const mutate of [v=>v.status='APPROVED',v=>v.id='OTHER',v=>v.purchase_units[0].custom_id='OTHER',v=>v.purchase_units[0].amount.value='0.01',v=>v.purchase_units[0].payments.captures[0].status='PENDING',v=>v.purchase_units[0].payments.captures[0].amount.currency_code='PEN',v=>v.purchase_units[0].payments.captures[0].final_capture=false]){const bad=structuredClone(order);mutate(bad);assert.equal(validCapture(bad,expected),null);}});
test('checkout uses fixed server price and requires purchase acknowledgement',async()=>{assert.equal((await run('checkout',{body:{}})).code,400);const f=mockFetch();const r=await run('checkout',{body:{acceptPurchase:true,price:0.01},fetcher:f});assert.equal(r.code,200);const sent=JSON.parse(f.calls.find(v=>v.url.endsWith('/v2/checkout/orders')).init.body);assert.equal(sent.purchase_units[0].amount.value,'9.90');assert.match(r.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Lax/);});
test('capture rejects external origin, wrong order and absent checkout cookie',async()=>{assert.equal((await run('capture',{jar:checkoutCookie,origin:'https://evil.test'})).code,403);assert.equal((await run('capture',{jar:checkoutCookie,body:{orderId:'OTHER'}})).code,401);assert.equal((await run('capture',{body:{orderId:'ORDER123'}})).code,401);});
test('verified capture issues access, repeat capture does not charge twice',async()=>{const f=mockFetch();for(let i=0;i<2;i++){const r=await run('capture',{jar:checkoutCookie,body:{orderId:'ORDER123'},fetcher:f});assert.equal(r.code,200);assert.match(r.headers['Set-Cookie'],/^__Host-access=/);}assert.equal(f.calls.filter(v=>v.url.endsWith('/capture')).length,0);});
test('approved order is captured with deterministic idempotency key',async()=>{let reads=0;const f=mockFetch();const fetcher=async(url,init)=>{if(url.endsWith('/ORDER123')&&reads++===0)return {ok:true,json:async()=>({...order,status:'APPROVED'})};return f(url,init);};const r=await run('capture',{jar:checkoutCookie,fetcher});assert.equal(r.code,200);assert.equal(f.calls.find(v=>v.url.endsWith('/capture')).init.headers['PayPal-Request-Id'],'capture-unique-ref');});
test('no protected content without valid cookie; refund revokes existing access',async()=>{assert.equal((await run('access')).code,401);const jar='__Host-access='+sign({kind:'access',order:'ORDER123',capture:'CAPTURE123'},cfg);const good=await run('access',{jar});assert.equal(good.code,200);assert(good.data.content);assert.match(good.headers['Cache-Control'],/no-store/);const bad=await run('access',{jar,fetcher:mockFetch({refunded:true})});assert.equal(bad.code,403);assert.equal(bad.data.content,undefined);});
test('recovery revalidates PayPal and issues secure cookie',async()=>{const token=sign({kind:'recovery',order:'ORDER123',capture:'CAPTURE123'},cfg);assert.equal((await run('restore',{body:{token}})).code,200);assert.equal((await run('restore',{body:{token},fetcher:mockFetch({refunded:true})})).code,403);});
test('live mode is gated and missing configuration fails closed',async()=>{assert.equal((await run('config',{environment:{}})).data.ready,false);assert.equal((await run('config',{environment:{...env,PAYPAL_MODE:'live'}})).data.ready,false);assert.equal((await run('checkout',{body:{acceptPurchase:true},environment:{...env,PAYPAL_MODE:'live'}})).code,503);assert.equal((await run('access',{method:'POST'})).code,405);});

const blobEnv={...env,GUIDE_BLOB_URL:'https://test-store.private.blob.vercel-storage.com/guide.pdf',BLOB_READ_WRITE_TOKEN:'mock-private-token'};
const fileFetch=async(url,init)=>url===blobEnv.GUIDE_BLOB_URL?new Response(init.method==='HEAD'?null:'%PDF-1.7\nprivate guide',{headers:{'Content-Type':'application/pdf'}}):mockFetch()(url,init);
test('live readiness needs an accessible private PDF',async()=>{
 const environment={...blobEnv,PAYPAL_MODE:'live'};
 assert.equal((await run('config',{environment,fetcher:fileFetch})).data.ready,true);
 assert.equal(await guideAvailable({...blobEnv,GUIDE_BLOB_URL:'https://evil.test/pdf'},fileFetch),false);
 assert.equal(await guideAvailable(blobEnv,async()=>new Response('missing',{status:404})),false);
 assert.equal(await guideAvailable(blobEnv,async()=>new Response('<html>',{headers:{'Content-Type':'text/html'}})),false);
});
test('download streams PDF only after verification, refunds and anonymous users denied',async()=>{
 assert.equal((await run('download',{environment:blobEnv,fetcher:fileFetch})).code,401);
 const jar='__Host-access='+sign({kind:'access',order:'ORDER123',capture:'CAPTURE123'},cfg);
 const good=await run('download',{jar,environment:blobEnv,fetcher:fileFetch});
 assert.equal(good.code,200);assert.equal(good.headers['Content-Type'],'application/pdf');assert.match(good.bytes.toString(),/^%PDF/);
 assert.equal((await run('download',{jar,environment:blobEnv,fetcher:mockFetch({refunded:true})})).code,403);
});
