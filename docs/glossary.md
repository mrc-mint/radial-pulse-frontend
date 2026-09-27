# Glossary

| Term | Meaning | Notes |
| --- | --- | --- |
| Platform Administrator | Platform-level administrator | Never "Internal Admin" |
| Digital Success Manager | Operational user working with assigned clinics | Never "Internal User" |
| Clinic Administrator | Clinic-side owner/administrator | May have several clinics |
| Clinic Team Member | Future role | Not a V1 experience |
| Assessment | The one unified digital-presence assessment | Code name |
| Audit Report / Unified Audit | User-facing label for an Assessment | No "audit type" anywhere |
| Section | A component of an assessment (Website, GBP, GEO, …) | Keys come from the contract |
| Not Available | A section with no engine available | Never a score of 0 |
| Unverified / Human Confirmed | Verification status of discovered profile data | Human-confirmed wins |
| Work item | A backend-produced action for a clinic | Kinds owned by the backend |
| Capability | A permission string from `GET /me` | UI only; backend enforces |
| Module | A feature that registers a manifest with the shell | Modules don't import each other |
