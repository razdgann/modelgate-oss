import test from 'node:test';
import assert from 'node:assert/strict';
import { PRICES, estimate } from '../src/pricing/registry.js';

test('reviewed and historical standard base rates remain stable', () => {
  for (const [provider, model, input, output] of [
    ['openai', 'gpt-6.1-sol', 2, 10],
    ['openai', 'gpt-6-luna', .1, .5],
    ['anthropic', 'claude-opus-5-5', 4, 20],
    ['anthropic', 'claude-sonnet-5-5', 2, 10],
    ['anthropic', 'claude-haiku-5-5', .1, .5],
    ['openai', 'gpt-6-astra', 10, 50],
    ['openai', 'gpt-5.6-sol', 4, 20],
    ['openai', 'gpt-5.6-terra', 2, 12],
    ['openai', 'gpt-5.6-luna', .2, 1.2],
    ['anthropic', 'claude-fable-5-1', 10, 50],
    ['anthropic', 'claude-opus-5', 5, 25],
    ['anthropic', 'claude-sonnet-5', 2, 10],
    ['anthropic', 'claude-haiku-4-5-20251001', 1, 5]
  ]) {
    const result = estimate(provider, model, 1000, 2000);
    assert.ok(Math.abs(result.total - (input + output * 2) / 1000) < 1e-12, model);
    assert.equal(result.known, true);
  }
});

test('registry IDs are unambiguous and aliases preserve estimates', () => {
  const ids = new Set();
  for (const entry of PRICES) {
    for (const id of [entry.model, ...entry.aliases]) {
      const key = `${entry.provider}/${id}`;
      assert.ok(!ids.has(key), key);
      ids.add(key);
      assert.deepEqual(estimate(entry.provider, id, 123, 456),
        estimate(entry.provider, entry.model, 123, 456));
    }
  }
  assert.equal(estimate('anthropic', 'gpt-6-astra', 1000, 1000).total, null);
  assert.equal(estimate('openai', 'gpt-6-astra-unverified', 1000, 1000).total, null);
});

 test('review dates do not rewrite when a rate became effective', () => {
  const astra = PRICES.find(p => p.model === 'gpt-6-astra');
  assert.equal(astra.effective, '2026-09-15');
  assert.equal(astra.reviewed, '2026-10-15');
  const terra = PRICES.find(p => p.model === 'gpt-5.6-terra');
  assert.equal(terra.reviewed, '2026-09-15');
  assert.equal(estimate('anthropic', 'claude-sonnet-5-5-unverified', 1, 1).total, null);
});
