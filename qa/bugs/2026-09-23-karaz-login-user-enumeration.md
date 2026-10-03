---
title: "[BE][Karaz][Admin][Auth] - Login API reveals whether a username exists via the error details key"
team: BE
severity: Medium
classification: Security
project_text: KARAZ
flow: Auth
scenario: "F-03 from Karaz admin exploration 2026-09-23"
summary: "Login API reveals whether a username exists via the error details key"
workaround: None known.
---

# Login API reveals whether a username exists via the error details key

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-03` in `../features/karaz-backoffice.md` |

## Environment

| | |
|---|---|
| Project | Karaz (multi-store e-commerce) |
| Environment | dev/test · `http://169.58.165.26` |
| Build | UI footer "Admin Panel v2.0" (no build id exposed) |
| Portal | Admin back-office `/KarazBackoffice` |
| Role / account | `admin` |
| Browser | Chromium (Playwright MCP) · 1440×900 |
| First seen | 2026-09-23 |
| Reproducible | 2/2 |

## Summary

The login UI shows a generic message, but the API response body tells the caller which field was wrong. An attacker can enumerate valid admin usernames and then target only those, which matters more because accounts lock after failed attempts.

## Steps to reproduce

1. `POST /KarazApi/api/Users/Login` with username `qa_nonexistent_user_zz` and any password.
2. Repeat with username `admin` and a wrong password.

## Expected

The same response for both cases: same status, message and `details` shape. Source: OWASP ASVS 2.2. The UI already intends a generic message (BR-KZ-01).

## Actual

Unknown user → `400`, `error.details.UserName = [Invalid username or password]`.
Wrong password → `400`, `error.details.Password = [Invalid username or password]`.

## Layer

| Layer | Finding |
|---|---|
| Network | `POST /api/Users/Login` → 400; the `details` key differs (`UserName` vs `Password`) |

**Classification:** Defect

## Impact

Low-effort reconnaissance against admin accounts. **Medium**: information disclosure, not direct compromise.

## Evidence

Response bodies captured 2026-09-23 (no credentials stored).

## Notes for the developer

Return one generic `details` key, or none, for all authentication failures.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
