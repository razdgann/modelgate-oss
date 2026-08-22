# Security Policy

## Reporting a vulnerability

Please use this repository's **Security → Report a vulnerability** flow to open a private GitHub Security Advisory. Do not open a public issue and do not include real API keys, customer data, or sensitive prompt content. If private vulnerability reporting is not enabled yet, the repository owner must enable it before making the project public.

Include the affected version, impact, and a minimal reproduction using placeholder credentials. Maintainers will coordinate remediation and disclosure through the advisory.

## Scope

The v0.1 dashboard/API has no built-in authentication and is local-only by default. Deployments that expose it require their own authenticated TLS reverse proxy and network controls. The public heuristic rule engine provides basic signals, not complete prompt-injection protection; a rule bypass alone is not necessarily a security vulnerability.
