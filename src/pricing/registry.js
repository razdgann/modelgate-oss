const PER_MILLION = 1_000_000;
// Standard text-token rates in USD. See docs/maintenance.md for scope and review steps.
// effective is when this registry starts applying a rate, not a claimed launch date.
const reviewed = '2026-09-15';
function price(provider, model, input, output, aliases = []) {
  return { provider, model, input:input/PER_MILLION, output:output/PER_MILLION,
    effective:reviewed, reviewed, source:provider === 'openai'
      ? 'https://developers.openai.com/api/docs/pricing'
      : 'https://platform.claude.com/docs/en/about-claude/pricing', aliases,
    scope:'Standard text tokens; base input/output rates only' };
}
export const PRICES = [
  price('openai', 'gpt-6-astra', 10, 50),
  price('openai', 'gpt-5.6-sol', 4, 20),
  price('openai', 'gpt-5.6-terra', 2, 12),
  price('openai', 'gpt-5.6-luna', .2, 1.2),
  price('anthropic', 'claude-fable-5-1', 10, 50),
  price('anthropic', 'claude-opus-5', 5, 25),
  price('anthropic', 'claude-sonnet-5', 2, 10),
  price('anthropic', 'claude-haiku-4-5-20251001', 1, 5),
  // Historical entries retained with their original review dates; not availability guarantees.
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
