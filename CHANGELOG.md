# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/).

## Unreleased

## v0.1.0 - 2026-08-22

- Initial OpenAI and Anthropic streaming gateway
- Local SQLite analytics, cost estimates, repetition and heuristic security detection
- Local dashboard, Docker deployment, examples, tests, and project documentation

### Known limitations

- Early release; APIs and SQLite schema may change
- Dashboard/API authentication must be supplied by operators when exposed beyond localhost
- Pricing is estimated from a manually maintained registry
- Streaming usage depends on providers emitting usage events
- Repetition groups are exact normalized matches, not semantic similarity
