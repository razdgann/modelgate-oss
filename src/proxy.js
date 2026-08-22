import { randomUUID } from 'node:crypto';
import { resolve, safeHeaders, usage } from './providers/index.js';
import { estimate } from './pricing/registry.js';
import { scan } from './security/rules.js';
import { fingerprint } from './analytics/repetition.js';

const readBody = async req => { const chunks=[]; for await(const c of req) chunks.push(Buffer.isBuffer(c)?c:Buffer.from(c)); return Buffer.concat(chunks); };
export async function proxy(req,res,{cfg,storage,fetchImpl=fetch}) {
  const route=resolve(req.url,cfg); if(!route){res.writeHead(404,{'content-type':'application/json'});return res.end(JSON.stringify({error:{code:'not_found',message:'Unsupported provider path'}}))}
  const id=randomUUID(), started=Date.now(), raw=await readBody(req); let body={}; try{body=raw.length?JSON.parse(raw):{}}catch{}
  const streaming=body.stream===true, model=body.model||'unknown', findings=scan(body), fp=fingerprint(body);
  let status=502,error=null,responseJson=null,outUsage={input:0,output:0,total:0};
  try {
    const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),cfg.timeoutMs);
    const upstream=await fetchImpl(route.url,{method:req.method,headers:safeHeaders(req.headers,route.definition),body:['GET','HEAD'].includes(req.method)?undefined:raw,signal:controller.signal}); clearTimeout(timer); status=upstream.status;
    const headers={}; upstream.headers.forEach((v,k)=>{if(!['content-encoding','content-length','transfer-encoding','connection'].includes(k))headers[k]=v}); headers['x-modelgate-request-id']=id; res.writeHead(status,headers);
    if(streaming && upstream.body){ const reader=upstream.body.getReader(); const decoder=new TextDecoder(); let capture=''; while(true){const {done,value}=await reader.read();if(done)break;res.write(value); if(capture.length<1_000_000)capture+=decoder.decode(value,{stream:true})} res.end(); outUsage=parseStreamUsage(route.provider,capture); if(cfg.captureContent)responseJson={stream:capture}; }
    else { const buf=Buffer.from(await upstream.arrayBuffer()); res.end(buf); try{responseJson=JSON.parse(buf.toString());outUsage=usage(route.provider,responseJson)}catch{} }
    if(status>=400) error=responseJson?.error?.message||`Provider returned HTTP ${status}`;
  } catch(e) { error=e.name==='AbortError'?'Provider request timed out':e.message; if(!res.headersSent){status=e.name==='AbortError'?504:502;res.writeHead(status,{'content-type':'application/json','x-modelgate-request-id':id});res.end(JSON.stringify({error:{code:'provider_error',message:error}}))}else res.end(); }
  finally { const costs=estimate(route.provider,model,outUsage.input,outUsage.output); try{storage.insert({id,timestamp:new Date().toISOString(),provider:route.provider,model,endpoint:new URL(req.url,'http://local').pathname,status,latency_ms:Date.now()-started,input_tokens:outUsage.input,output_tokens:outUsage.output,total_tokens:outUsage.total,input_cost:costs.input,output_cost:costs.output,total_cost:costs.total,streaming,app:req.headers['x-modelgate-app']||null,user_id:req.headers['x-modelgate-user']||null,feature:req.headers['x-modelgate-feature']||null,tags:(req.headers['x-modelgate-tags']||'').split(',').map(x=>x.trim()).filter(Boolean),error,findings,fingerprint:fp,request_content:cfg.captureContent?JSON.stringify(body):null,response_content:cfg.captureContent&&responseJson?JSON.stringify(responseJson):null})}catch(e){console.error('analytics persistence failed:',e.message)} }
}
function parseStreamUsage(provider,text){let last={input:0,output:0,total:0};for(const line of text.split('\n'))if(line.startsWith('data: ')&&line.slice(6)!=='[DONE]')try{const j=JSON.parse(line.slice(6));const u=usage(provider,j);if(u.total)last=u}catch{}return last}
