# ModelGate OSS

**A local-first LLM gateway for cost visibility, usage analytics, and basic runtime security.**

Point the OpenAI or Anthropic SDK at ModelGate, keep normal provider responses—including streams—and inspect metadata locally at `http://localhost:3000`. No account required. Prompt and response content is **not stored by default**.

> Dashboard preview: run the two-minute quick start below. The dashboard uses your real traffic and never fabricates analytics.

## What it does

- Proxies OpenAI Chat Completions and Responses, plus Anthropic Messages
- Streams responses without waiting for completion
- Tracks tokens, estimated model costs, latency, provider errors, and custom application metadata
- Finds exactly repeated normalized prompts locally
- Flags obvious prompt-injection patterns with transparent heuristic rules
- Stores data in an embedded SQLite database and ships a searchable local dashboard

## Two-minute quick start

```bash
git clone git@github.com:modelgate-oss.git
cd modelgate-oss
cp .env.example .env
# Add OPENAI_API_KEY and/or ANTHROPIC_API_KEY to .env
docker compose up --build
```

Open [localhost:3000](http://localhost:3000). The gateway is at `http://localhost:8080`.

## OpenAI

```python
from openai import OpenAI
client = OpenAI(api_key="...", base_url="http://localhost:8080/v1")
response = client.responses.create(model="gpt-4o-mini", input="Hello")
```

Existing `Authorization` headers are never stored. ModelGate replaces them with `OPENAI_API_KEY` from its own environment before forwarding.

## Anthropic

Use `http://localhost:8080/anthropic` as the Anthropic SDK base URL. Requests to `/anthropic/v1/messages` are forwarded to Anthropic using `ANTHROPIC_API_KEY`.

## Dashboard and API

Overview metrics support 24-hour, 7-day, and 30-day windows. Requests are searchable and open into metadata/content details. APIs include `/api/stats`, `/api/requests`, `/api/requests/:id`, `/api/costs`, `/api/models`, `/api/repetitions`, `/api/security`, and `/health`. Lists are paginated; errors use `{ "error": { "code", "message" } }`.

Costs are estimates from the dated central registry in `src/pricing/registry.js`. Unknown models continue normally and show no estimate. Pricing changes over time—verify the registry before financial decisions.

## Privacy

`MODELGATE_CAPTURE_CONTENT=false` is the default. Only operational metadata and a one-way normalized prompt fingerprint are persisted. Enable capture only for local debugging after reviewing your data-handling obligations. Custom `X-ModelGate-User` values should be pseudonymous, not email addresses or names.

Optional headers: `X-ModelGate-App`, `X-ModelGate-User`, `X-ModelGate-Feature`, and comma-separated `X-ModelGate-Tags`.

## Architecture

One Node.js service handles provider-aware forwarding and the analytics API, with an independently served embedded dashboard. Modules isolate providers, pricing, security, repetition analysis, and SQLite storage so each can evolve independently. Persistence happens after response forwarding and failures do not replace successful provider responses.

## Self-hosting and configuration

| Variable | Default | Purpose |
|---|---:|---|
| `MODELGATE_PORT` | `8080` | Gateway/API port |
| `MODELGATE_DASHBOARD_PORT` | `3000` | Dashboard port |
| `MODELGATE_DATABASE_URL` | `./data/modelgate.db` | SQLite path |
| `MODELGATE_CAPTURE_CONTENT` | `false` | Store prompt/response bodies |
| `MODELGATE_LOG_LEVEL` | `info` | Log level |
| `MODELGATE_PROVIDER_TIMEOUT_MS` | `120000` | Provider timeout |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | — | Provider credentials |

For an internet-accessible deployment, put authenticated TLS termination in front of both ports, restrict network access, encrypt disks/backups, set retention, and protect `.env`. ModelGate intentionally supports only configured provider origins, preventing arbitrary-proxy and SSRF use.

## Security

The open-source rule engine reports informational, suspicious, and high-risk patterns. It is heuristic visibility—not complete prompt-injection protection. Rules are readable and extensible in `src/security/rules.js`. Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Development

Requires Node.js 22.5+ (24 recommended).

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md). The roadmap includes more provider adapters, export/retention controls, approximate local repetition grouping, and a pluggable database backend.

## ModelGate Cloud

ModelGate OSS remains useful without an account. ModelGate Cloud is intended for continuous optimization, advanced runtime protection, shared team analytics, longer retention, and automatic optimization recommendations. Proprietary optimization and detection technology is intentionally not present here.

## License

Apache License 2.0. See [LICENSE](LICENSE). Licensing should be reviewed before accepting unusually large external contributions.
