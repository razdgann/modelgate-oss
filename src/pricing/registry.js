const PER_MILLION = 1_000_000;
export const PRICES = [
  { provider:'openai', model:'gpt-4o', input:2.5/PER_MILLION, output:10/PER_MILLION, effective:'2024-10-01', reviewed:'2026-08-22', source:'https://platform.openai.com/docs/pricing', aliases:['gpt-4o-2024-11-20'] },
  { provider:'openai', model:'gpt-4o-mini', input:.15/PER_MILLION, output:.6/PER_MILLION, effective:'2024-07-18', reviewed:'2026-08-22', source:'https://platform.openai.com/docs/pricing', aliases:['gpt-4o-mini-2024-07-18'] },
  { provider:'anthropic', model:'claude-3-5-sonnet', input:3/PER_MILLION, output:15/PER_MILLION, effective:'2024-06-20', reviewed:'2026-08-22', source:'https://docs.anthropic.com/en/docs/about-claude/pricing', aliases:['claude-3-5-sonnet-20241022'] },
  { provider:'anthropic', model:'claude-3-5-haiku', input:.8/PER_MILLION, output:4/PER_MILLION, effective:'2024-10-22', reviewed:'2026-08-22', source:'https://docs.anthropic.com/en/docs/about-claude/pricing', aliases:['claude-3-5-haiku-20241022'] }
];
export function estimate(provider, model, input=0, output=0) {
  const p = PRICES.find(x => x.provider === provider && (x.model === model || x.aliases.includes(model)));
  if (!p) return { input:null, output:null, total:null, known:false };
  const i=input*p.input, o=output*p.output;
  return { input:i, output:o, total:i+o, known:true };
}
