# 0002 — Shared tokens and prop contracts, separate web and native UI

Status: accepted

The web app is dense operational tooling; the mobile app is a touch-first
Clinic Administrator product. A universal UI kit would push them toward the
same UI. `ui/shared` holds contracts and semantics; `ui/web` and `ui/native`
implement them.
