import {PublicError} from './paypal.js';

function location(env){
 try {
  const url=new URL(env.GUIDE_BLOB_URL);
  if(url.protocol==='https:'&&/^[a-z0-9-]+\.private\.blob\.vercel-storage\.com$/.test(url.hostname)&&!url.username&&!url.password&&!url.port&&!url.search&&!url.hash&&env.BLOB_READ_WRITE_TOKEN)return url.href;
 }catch{}
 return null;
}
export async function diagnoseGuide(env,fetcher=fetch){
 if(!env.GUIDE_BLOB_URL)return {ok:false,code:'PDF_URL_MISSING'};
 if(!env.BLOB_READ_WRITE_TOKEN)return {ok:false,code:'PDF_TOKEN_MISSING'};
 const url=location(env);
 if(!url)return {ok:false,code:'PDF_URL_INVALID'};
 if(new URL(url).pathname==='/')return {ok:false,code:'PDF_URL_IS_STORE_ROOT'};
 try{
  const response=await fetcher(url,{method:'HEAD',redirect:'error',headers:{Authorization:'Bearer '+env.BLOB_READ_WRITE_TOKEN},signal:AbortSignal.timeout(10000)});
  const status=response.status;
  const type=response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
  await response.body?.cancel();
  if(status===401||status===403)return {ok:false,code:'PDF_ACCESS_DENIED',httpStatus:status};
  if(status===404)return {ok:false,code:'PDF_NOT_FOUND',httpStatus:status};
  if(!response.ok)return {ok:false,code:'PDF_HTTP_ERROR',httpStatus:status};
  if(type!=='application/pdf')return {ok:false,code:'PDF_CONTENT_TYPE_INVALID'};
  return {ok:true,code:'PDF_OK'};
 }catch(error){
  return {ok:false,code:['TimeoutError','AbortError'].includes(error?.name)?'PDF_TIMEOUT':'PDF_CONNECTION_FAILED'};
 }
}
async function getFile(env,fetcher,method){
 const url=location(env);
 if(!url)throw new PublicError(503,'La descarga no está disponible en este momento.');
 const response=await fetcher(url,{method,redirect:'error',headers:{Authorization:'Bearer '+env.BLOB_READ_WRITE_TOKEN},signal:AbortSignal.timeout(30000)});
 if(!response.ok||response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase()!=='application/pdf'){
  await response.body?.cancel();throw new PublicError(503,'No pudimos abrir la guía. Vuelve a intentarlo más tarde.');
 }
 return response;
}
export async function guideAvailable(env,fetcher=fetch){return (await diagnoseGuide(env,fetcher)).ok;}
export async function openGuide(env,fetcher=fetch){return getFile(env,fetcher,'GET');}
