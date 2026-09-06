# Threat model

## Assets and trust boundaries

The protected asset is a single Integration Recovery API key held by n8n's
encrypted credential facility. Untrusted inputs are the `check`/`checks` JSON,
the remote HTTP response, and any upstream n8n expression value. The only
network destination in the descriptor is the fixed HTTPS origin
`integrationrecovery-api.com` and the only action route is `/v1/checks`.

## Threats and controls

- **Secret disclosure:** password-backed credential property; generic Bearer
  injection; no console output; safe errors omit headers, details, payloads,
  and raw response bodies.
- **SSRF/origin injection:** origin and path are constants; no URL parameter.
- **Unexpected mutation:** only the documented analysis POST is present; no
  provider credential, remediation operation, webhook, or trigger exists.
- **Duplicate work/unbounded retry:** no retry configuration or loop exists;
  each input item creates at most one request.
- **Contract confusion:** source commit and OpenAPI digest are pinned in the
  candidate root; success must contain exact top-level `count`, `breaking`, and
  `checks` fields.
- **Error-body injection:** only bounded message, code, status, and request ID
  are surfaced; bearer/x-api-key patterns are redacted.
- **Supply-chain expansion:** package declares zero runtime dependencies and
  ships only compiled node, credential, docs, license, and icon.

## Residual risk

This candidate has not run inside the current official n8n scaffold/runtime or
Creator verification pipeline. That provider-runtime and review work remains a
release gate. A fixture/mock pass is not evidence of a production integration
or commercial attribution.
