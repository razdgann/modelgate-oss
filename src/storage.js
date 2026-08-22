import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export class Storage {
  constructor(path) {
    if (path !== ':memory:') mkdirSync(dirname(path), {recursive:true});
    this.db=new DatabaseSync(path);
    this.db.exec(`CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY, timestamp TEXT NOT NULL, provider TEXT, model TEXT, endpoint TEXT, status INTEGER,
      latency_ms INTEGER, input_tokens INTEGER DEFAULT 0, output_tokens INTEGER DEFAULT 0, total_tokens INTEGER DEFAULT 0,
      input_cost REAL, output_cost REAL, total_cost REAL, streaming INTEGER DEFAULT 0, app TEXT, user_id TEXT,
      feature TEXT, tags TEXT, error TEXT, findings TEXT DEFAULT '[]', fingerprint TEXT, request_content TEXT, response_content TEXT
    ); CREATE INDEX IF NOT EXISTS idx_requests_timestamp ON requests(timestamp DESC); CREATE INDEX IF NOT EXISTS idx_requests_fingerprint ON requests(fingerprint);`);
  }
  insert(r) { this.db.prepare(`INSERT INTO requests VALUES (${Array(23).fill('?').join(',')})`).run(r.id,r.timestamp,r.provider,r.model,r.endpoint,r.status,r.latency_ms,r.input_tokens,r.output_tokens,r.total_tokens,r.input_cost,r.output_cost,r.total_cost,r.streaming?1:0,r.app,r.user_id,r.feature,JSON.stringify(r.tags||[]),r.error,JSON.stringify(r.findings||[]),r.fingerprint,r.request_content,r.response_content); }
  list({limit=50,offset=0,provider,model,status,search}={}) { const where=[], args=[]; if(provider){where.push('provider=?');args.push(provider)} if(model){where.push('model=?');args.push(model)} if(status){where.push('status=?');args.push(status)} if(search){where.push('(model LIKE ? OR endpoint LIKE ? OR app LIKE ?)');args.push(...Array(3).fill(`%${search}%`))} const w=where.length?'WHERE '+where.join(' AND '):''; const total=this.db.prepare(`SELECT count(*) n FROM requests ${w}`).get(...args).n; const rows=this.db.prepare(`SELECT * FROM requests ${w} ORDER BY timestamp DESC LIMIT ? OFFSET ?`).all(...args,limit,offset).map(decode); return {data:rows,pagination:{limit,offset,total}}; }
  get(id) { const r=this.db.prepare('SELECT * FROM requests WHERE id=?').get(id); return r&&decode(r); }
  stats(since) { return this.db.prepare(`SELECT count(*) requests, COALESCE(sum(total_tokens),0) tokens, COALESCE(sum(total_cost),0) spend, COALESCE(avg(latency_ms),0) latency, COALESCE(avg(CASE WHEN status>=400 THEN 1.0 ELSE 0 END),0) error_rate, COALESCE(sum(CASE WHEN findings!='[]' THEN 1 ELSE 0 END),0) flagged FROM requests WHERE timestamp>=?`).get(since); }
  costs(since) { return this.db.prepare(`SELECT provider,model,endpoint,count(*) requests,sum(total_cost) estimated_cost FROM requests WHERE timestamp>=? GROUP BY provider,model,endpoint ORDER BY estimated_cost DESC`).all(since); }
  repetitions(since) { return this.db.prepare(`SELECT fingerprint,model,count(*) count,min(timestamp) first_seen,max(timestamp) last_seen FROM requests WHERE timestamp>=? AND fingerprint IS NOT NULL GROUP BY fingerprint,model HAVING count(*)>1 ORDER BY count DESC`).all(since); }
  security(since) { return this.db.prepare(`SELECT id,timestamp,provider,model,findings FROM requests WHERE timestamp>=? AND findings!='[]' ORDER BY timestamp DESC`).all(since).map(r=>({...r,findings:JSON.parse(r.findings)})); }
}
function decode(r){return {...r,streaming:!!r.streaming,tags:JSON.parse(r.tags||'[]'),findings:JSON.parse(r.findings||'[]'),request_content:r.request_content&&JSON.parse(r.request_content),response_content:r.response_content&&JSON.parse(r.response_content)}}
