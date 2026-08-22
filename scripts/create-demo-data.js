import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { Storage } from '../src/storage.js';
import { estimate } from '../src/pricing/registry.js';

const database=resolve(process.argv[2]||'data/modelgate-demo.db');
for(const suffix of ['', '-shm', '-wal']) rmSync(database+suffix,{force:true});
const storage=new Storage(database), now=Date.now();
const samples=[
  ['gpt-4o-mini','/v1/responses',724,188,420,200,'checkout-assistant','repeat-product-summary',[]],
  ['gpt-4o-mini','/v1/responses',724,190,398,200,'checkout-assistant','repeat-product-summary',[]],
  ['gpt-4o-mini','/v1/responses',724,184,441,200,'checkout-assistant','repeat-product-summary',[]],
  ['gpt-4o','/v1/chat/completions',1820,612,1284,200,'support-copilot','repeat-support-triage',[]],
  ['gpt-4o','/v1/chat/completions',1820,601,1198,200,'support-copilot','repeat-support-triage',[]],
  ['gpt-4o-mini','/v1/responses',405,92,286,200,'docs-search',null,[]],
  ['gpt-4o-mini','/v1/chat/completions',881,0,832,429,'support-copilot',null,[]],
  ['gpt-4o','/v1/chat/completions',1331,420,997,200,'support-copilot',null,[{id:'instruction-override',severity:'suspicious',explanation:'Attempts to override earlier instructions'}]],
  ['gpt-4o-mini','/v1/responses',517,106,344,200,'release-notes',null,[]],
  ['gpt-4o-mini','/v1/responses',298,77,251,200,'docs-search',null,[]],
  ['gpt-4o','/v1/chat/completions',2064,544,1421,200,'support-copilot',null,[{id:'system-prompt-exfiltration',severity:'high',explanation:'Requests disclosure of hidden or system instructions'}]],
  ['gpt-4o-mini','/v1/responses',632,141,309,200,'checkout-assistant',null,[]]
];
samples.forEach((s,i)=>{const [model,endpoint,input,output,latency,status,app,fingerprint,findings]=s,cost=estimate('openai',model,input,output);storage.insert({id:`demo-${String(i+1).padStart(3,'0')}`,timestamp:new Date(now-i*21*60_000).toISOString(),provider:'openai',model,endpoint,status,latency_ms:latency,input_tokens:input,output_tokens:output,total_tokens:input+output,input_cost:cost.input,output_cost:cost.output,total_cost:cost.total,streaming:i%3===0,app,user_id:null,feature:i%2?'assistant':'generation',tags:['demo'],error:status>=400?'Example provider rate limit':null,findings,fingerprint,request_content:null,response_content:null})});
console.log(`Created 12 clearly labeled demo records in ${database}`);
