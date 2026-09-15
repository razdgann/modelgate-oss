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

This is a manual review process; no automatic price synchronization is configured.
