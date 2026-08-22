import http from 'node:http'; import { readFileSync } from 'node:fs'; import { fileURLToPath } from 'node:url'; import { dirname,join } from 'node:path';
import { config } from './config.js'; import { Storage } from './storage.js'; import { proxy } from './proxy.js'; import { api } from './api.js';
const cfg=config(), storage=new Storage(cfg.database), root=join(dirname(fileURLToPath(import.meta.url)),'dashboard');
const serve=(req,res)=>{let file=req.url==='/'?'index.html':req.url.slice(1);if(!['index.html','app.js','style.css'].includes(file))file='index.html';const type=file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html';res.writeHead(200,{'content-type':type});res.end(readFileSync(join(root,file)))};
const gateway=http.createServer((req,res)=>{if(req.url==='/health'||req.url.startsWith('/api/')){if(api(req,res,storage,cfg)!==false)return}proxy(req,res,{cfg,storage})});
gateway.listen(cfg.port,()=>console.log(`ModelGate gateway and API listening on :${cfg.port}`));
if(cfg.dashboardPort!==cfg.port)http.createServer((req,res)=>req.url.startsWith('/api/')||req.url==='/health'?api(req,res,storage,cfg):serve(req,res)).listen(cfg.dashboardPort,()=>console.log(`ModelGate dashboard listening on :${cfg.dashboardPort}`));
