export const RULES = [
  { id:'instruction-override', severity:'suspicious', explanation:'Attempts to override earlier instructions', re:/\b(ignore|disregard|forget)\b.{0,40}\b(previous|prior|above|instructions?)\b/i },
  { id:'system-prompt-exfiltration', severity:'high', explanation:'Requests disclosure of hidden or system instructions', re:/\b(reveal|show|print|repeat|expose)\b.{0,50}\b(system prompt|hidden (context|instructions?)|developer message)\b/i },
  { id:'secret-exfiltration', severity:'high', explanation:'Requests credentials or secret material', re:/\b(reveal|show|print|extract|expose)\b.{0,40}\b(api[- ]?key|password|secret|credentials?|token)\b/i },
  { id:'policy-override', severity:'suspicious', explanation:'Attempts to bypass a policy or safety control', re:/\b(bypass|override|disable|evade)\b.{0,30}\b(policy|guardrail|safety|restriction)\b/i },
  { id:'tool-manipulation', severity:'informational', explanation:'Attempts to manipulate tool instructions', re:/\b(tool|function)\b.{0,30}\b(ignore|override|hidden instructions?)\b/i }
];
export function scan(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return RULES.filter(r=>r.re.test(text)).map(({id,severity,explanation})=>({id,severity,explanation}));
}
