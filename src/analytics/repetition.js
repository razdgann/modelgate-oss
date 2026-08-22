import { createHash } from 'node:crypto';
export function normalize(text='') { return text.toLowerCase().replace(/\s+/g,' ').replace(/[^\p{L}\p{N} ]/gu,'').trim(); }
export function fingerprint(body) {
  const parts=[];
  if (body?.messages) for (const m of body.messages) parts.push(`${m.role}:${typeof m.content==='string'?m.content:JSON.stringify(m.content)}`);
  else if (body?.input) parts.push(typeof body.input==='string'?body.input:JSON.stringify(body.input));
  else if (body?.prompt) parts.push(body.prompt);
  if (!parts.length) return null;
  return createHash('sha256').update(normalize(parts.join('|'))).digest('hex');
}
