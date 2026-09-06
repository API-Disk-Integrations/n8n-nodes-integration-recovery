# Integration Recovery for n8n — local release candidate

This package contains one action-only n8n community node: **Check Integration
Drift**. It sends either one exact `check` object or an ordered `checks` array to
`POST https://integrationrecovery-api.com/v1/checks` and returns the exact API
response as an n8n item. It has no trigger, polling loop, webhook, remediation,
or retry path.

## Safety boundary

- The credential field is secret/password-backed and injects
  `Authorization: Bearer` through n8n's credential system.
- No customer/provider credential other than the Integration Recovery key is
  accepted.
- The node returns repair recommendations; it never applies them.
- HTTP failures preserve only safe `code`, HTTP status, message, and
  `requestId`. Raw request bodies, response bodies, and auth headers are not
  logged.
- Calls fail closed after a 10-second timeout and are never retried.

## Inputs

Choose one input mode:

1. **Single Check** — exact JSON object with required `integrationId`,
   `provider`, `previous`, and `current` properties.
2. **Ordered Batch** — JSON array of 1–50 exact check objects.

Both JSON fields accept n8n expressions. Their defaults are `$json.check` and
`$json.checks`, so separate input items resolve independently. Declarative n8n
routing preserves item order and item linking. Standard n8n
**Continue On Fail** can retain a failed item; the safe error carries the API
code, status, and request ID.

## Local verification

This is a provider-free candidate. From this directory, with TypeScript on
`PATH`:

```sh
npm run build
npm run lint
npm test
npm pack
```

The package has zero runtime dependencies. The release audit separately
installs the generated tarball into an empty temporary project and loads its
compiled node and credential descriptors.

## Release gates still closed

The npm name is a candidate, not a reservation. No npm package, GitHub
repository, n8n Creator Portal submission, verified discovery entry, account,
credential, or production call was created here. Before release, revalidate
n8n's current scaffold/UX/verification rules, publish through an approved
GitHub Actions OIDC/provenance workflow, confirm the canonical public source
binding, and obtain the separate owner publication and Creator review gates.

The packed node uses declarative routing. Its dedicated credential descriptor
performs generic Bearer-header injection, so the programmatic-only
`httpRequestWithAuthentication` helper does not apply. The package declares its
node and credential paths, has the `n8n-community-node-package` keyword, carries
no runtime dependency, does not access environment variables or the filesystem,
and passes the local descriptor/lint suite. The official
`npx @n8n/scan-community-package` result remains **HOLD** because the scanner was
not already available in the offline build environment; it must pass in the
future clean public-repository release workflow before submission or publication.
