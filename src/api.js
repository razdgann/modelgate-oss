import { PRICES } from './pricing/registry.js';
const since = u => { const period=['24h','7d','30d'].includes(u.searchParams.get('period'))?u.searchParams.get('period'):'24h'; const ms={"24h":864e5,"7d":6048e5,"30d":2592e6}[period]; return new Date(Date.now()-ms).toISOString(); };
const send=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-frame-options':'DENY'});res.end(JSON.stringify(data))};
export function api(req,res,storage,cfg) {
  const u=new URL(req.url,'http://localhost'); if(req.method!=='GET')return send(res,405,{error:{code:'method_not_allowed',message:'Only GET is supported'}});
  try {
    if(u.pathname==='/health')return send(res,200,{status:'ok',capture_content:cfg.captureContent,demo_mode:cfg.demoMode,telemetry:'disabled'});
    if(u.pathname==='/api/stats')return send(res,200,{data:storage.stats(since(u)),estimated_costs:true});
    if(u.pathname==='/api/costs')return send(res,200,{data:storage.costs(since(u)),estimated:true});
    if(u.pathname==='/api/models')return send(res,200,{data:PRICES});
    if(u.pathname==='/api/repetitions')return send(res,200,{data:storage.repetitions(since(u))});
    if(u.pathname==='/api/security')return send(res,200,{data:storage.security(since(u)),notice:'Heuristic findings are signals, not complete prompt-injection protection.'});
    if(u.pathname==='/api/requests'){const limit=Math.min(100,Math.max(1,Number(u.searchParams.get('limit'))||50)),offset=Math.max(0,Number(u.searchParams.get('offset'))||0);return send(res,200,storage.list({limit,offset,provider:u.searchParams.get('provider'),model:u.searchParams.get('model'),status:Number(u.searchParams.get('status'))||null,search:u.searchParams.get('search')}))}
    const match=u.pathname.match(/^\/api\/requests\/([^/]+)$/);if(match){const row=storage.get(match[1]);return row?send(res,200,{data:row,content_captured:cfg.captureContent}):send(res,404,{error:{code:'not_found',message:'Request not found'}})}
    return send(res,404,{error:{code:'not_found',message:'API endpoint not found'}});
  } catch(e){send(res,400,{error:{code:'bad_request',message:e.message}})}
}
