import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { proxy } from '../src/proxy.js';
import { api } from '../src/api.js';
import { Storage } from '../src/storage.js';

const cfg={openaiUrl:'https://openai.test',anthropicUrl:'https://anthropic.test',timeoutMs:1000,maxRequestBytes:1024,captureContent:false,demoMode:false};
function request(body,url='/v1/responses',headers={'content-type':'application/json'}){const req=Readable.from([body]);return Object.assign(req,{url,method:'POST',headers})}
function response(){return {headersSent:false,chunks:[],writeHead(status,headers={}){this.status=status;this.headers=headers;this.headersSent=true},write(value){this.chunks.push(Buffer.from(value))},end(value){if(value)this.chunks.push(Buffer.from(value))},json(){return JSON.parse(Buffer.concat(this.chunks).toString())}}}

test('malformed JSON is rejected without calling a provider',async()=>{const res=response();let called=false;await proxy(request('{broken'),res,{cfg,storage:new Storage(':memory:'),fetchImpl:async()=>{called=true}});assert.equal(res.status,400);assert.equal(res.json().error.code,'invalid_json');assert.equal(called,false)});

test('oversized requests return a structured 413',async()=>{const res=response();await proxy(request(JSON.stringify({input:'x'.repeat(2000)})),res,{cfg,storage:new Storage(':memory:'),fetchImpl:async()=>assert.fail('provider should not be called')});assert.equal(res.status,413);assert.equal(res.json().error.code,'request_too_large')});

test('provider errors are relayed and recorded without secrets',async()=>{process.env.OPENAI_API_KEY='upstream-test-secret';const storage=new Storage(':memory:'),res=response();await proxy(request(JSON.stringify({model:'unknown-model',input:'private prompt'}),'/v1/responses',{authorization:'Bearer incoming-secret',cookie:'session=private','content-type':'application/json'}),res,{cfg,storage,fetchImpl:async(_url,options)=>{assert.equal(options.headers.get('cookie'),null);return new Response(JSON.stringify({error:{message:'Example rate limit'}}),{status:429,headers:{'content-type':'application/json'}})}});assert.equal(res.status,429);const persisted=JSON.stringify(storage.list().data);assert.equal(persisted.includes('incoming-secret'),false);assert.equal(persisted.includes('upstream-test-secret'),false);assert.equal(persisted.includes('private prompt'),false);assert.equal(storage.list().data[0].error,'Example rate limit')});

test('content capture is explicit and local',async()=>{const storage=new Storage(':memory:'),res=response();await proxy(request(JSON.stringify({model:'gpt-4o-mini',input:'captured example'})),res,{cfg:{...cfg,captureContent:true},storage,fetchImpl:async()=>new Response(JSON.stringify({output_text:'captured response',usage:{input_tokens:1,output_tokens:2}}),{status:200,headers:{'content-type':'application/json'}})});const row=storage.list().data[0];assert.equal(row.request_content.input,'captured example');assert.equal(row.response_content.output_text,'captured response')});

test('analytics API returns data and predictable 404 errors',()=>{const storage=new Storage(':memory:'),ok=response(),missing=response();api({method:'GET',url:'/api/stats'},ok,storage,cfg);assert.equal(ok.status,200);assert.equal(ok.json().estimated_costs,true);api({method:'GET',url:'/api/does-not-exist'},missing,storage,cfg);assert.equal(missing.status,404);assert.equal(missing.json().error.code,'not_found')});
