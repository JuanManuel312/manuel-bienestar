import {PublicError} from './paypal.js';

function location(env){
 try {
  const url=new URL(env.GUIDE_BLOB_URL);
  if(url.protocol==='https:'&&/^[a-z0-9-]+\.private\.blob\.vercel-storage\.com$/.test(url.hostname)&&!url.username&&!url.password&&!url.port&&!url.search&&!url.hash&&env.BLOB_READ_WRITE_TOKEN)return url.href;
 }catch{}
 return null;
}
async function getFile(env,fetcher,method){
 const url=location(env);
 if(!url)throw new PublicError(503,'La descarga no está disponible en este momento.');
 const response=await fetcher(url,{method,redirect:'error',headers:{Authorization:'Bearer '+env.BLOB_READ_WRITE_TOKEN},signal:AbortSignal.timeout(30000)});
 if(!response.ok||response.headers.get('content-type')?.split(';')[0]!=='application/pdf'){
  await response.body?.cancel();throw new PublicError(503,'No pudimos abrir la guía. Vuelve a intentarlo más tarde.');
 }
 return response;
}
export async function guideAvailable(env,fetcher=fetch){try{await getFile(env,fetcher,'HEAD');return true;}catch{return false;}}
export async function openGuide(env,fetcher=fetch){return getFile(env,fetcher,'GET');}
