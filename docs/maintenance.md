# Maintenance

Review model IDs, prices, and provider deprecations monthly and before each release.
Also review provider usage/streaming formats and supported Node.js releases when
upgrading integrations. New model IDs generally forward without gateway changes;
cost estimates require a matching registry entry.

## Pricing review

1. Compare `src/pricing/registry.js` with [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
   and [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing).
   Verify exact API IDs in the provider model documentation; do not guess snapshot aliases.
2. Record USD rates per token (divide published per-million rates by 1,000,000),
   the official source, and the date actually reviewed. `effective` records when
   the registry starts using a new rate. Preserve historical entries and their
   review dates unless their rates have actually been verified again.
3. Check provider deprecation notices. Registry membership does not mean a model
   remains available. Do not silently rewrite users' requested model IDs.
4. Add regression coverage for changed rates and aliases, then run `npm test`,
   `npm run lint`, `npm run typecheck`, and `npm run build`.
5. Release the update. Operators must update their checkout/image and restart.
   Stored request costs remain historical; there is no automatic repricing.

## Review on 2026-09-15

Added the four OpenAI flagship IDs from its Standard pricing table and the four
current Claude IDs from its [model overview](https://platform.claude.com/docs/en/models/overview).
Claude Sonnet 5 uses the confirmed standard $2 input / $10 output per million
tokens; the previously announced September increase was cancelled.
The four older entries retain their previous review dates and rates.

Estimates cover base standard text input/output tokens only. OpenAI flagship rates
are the short-context rates. Long-context premiums, caching discounts and writes,
service tiers, regional premiums, and tool/media charges are not calculated.
The registry is intentionally not a complete provider catalog. Unrecognized IDs
continue forwarding with a null estimate, never a guessed price.

A monthly Codex task reviews official sources, runs the checks, and commits and pushes verified updates to main. Runtime pricing does not synchronize automatically.


## Review on 2026-10-15

Added GPT-6.1 Sol ($2/$10), GPT-6 Luna ($0.10/$0.50), Claude Opus 5.5
($4/$20), Sonnet 5.5 ($2/$10), and Haiku 5.5 ($0.10/$0.50), in USD per
million input/output tokens. Sources are the official pricing pages above and
[Claude model IDs](https://platform.claude.com/docs/en/models/overview).
Reverified Astra, GPT-5.6 Sol, Fable 5.1, Opus 5, Sonnet 5 and Haiku 4.5
without changing their rates or effective dates. Other historical review dates remain unchanged.

Haiku 5.5 base rates apply only up to 100,000 prompt tokens; above this,
its rates are $0.50/$2.50. Prompt length includes cache reads and writes.
This tier adjustment is not calculated by the current estimator. Fast/ultrafast,
caching, regional premiums and tool fees also remain outside its scope.

[OpenAI deprecations](https://developers.openai.com/api/docs/deprecations)
now list the GPT-4o November 2024 and GPT-4o mini July 2024 snapshots in this
registry for shutdown January 14, 2027.
[Claude deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)
list Sonnet 4.5 for retirement November 30, 2026 and Haiku 3.5 as already retired.
Historical pricing entries are retained; requests are never automatically migrated.
