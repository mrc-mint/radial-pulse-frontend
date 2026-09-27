# 0003 — Runtime config.json for web

Status: accepted

The web build contains no environment values. `/config.json` is served per
environment (S3 + CloudFront, no caching) and validated at boot by
`@radial-pulse/config`. The artifact tested in dev is the one promoted to
prod. Mobile keeps build-time config per EAS profile.
