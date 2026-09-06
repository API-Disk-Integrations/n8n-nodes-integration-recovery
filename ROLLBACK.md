# Rollback plan

No external state exists for this local candidate, so rollback now is simply
to stop using its generated tarball. Do not delete evidence needed for audit.

For a future release:

1. Publish an immutable exact version through the approved GitHub Actions OIDC
   and provenance workflow; never overwrite it.
2. Keep the previously verified exact version installable and record its
   digest before promoting another version.
3. On contract drift, secret exposure, unexpected network activity, false
   success, item-order breakage, or unintended remediation, stop promotion and
   direct consumers back to the last verified exact version.
4. Deprecate the affected npm version with a safe migration message only after
   owner approval. Follow n8n's current disable/removal process and notify
   affected consumers through an approved channel.
5. Rotate any credential that could have been exposed and preserve request IDs
   and value-free evidence for incident review.
