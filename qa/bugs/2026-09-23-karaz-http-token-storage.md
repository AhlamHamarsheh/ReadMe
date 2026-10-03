---
title: "[FE & BE][Karaz][Admin][Auth] - Admin panel served over plain HTTP and access token stored in script-readable cookie and localStorage"
team: FE & BE
severity: High
classification: Security
project_text: KARAZ
flow: Auth
scenario: "F-01 from Karaz admin exploration 2026-09-23"
summary: "Admin panel served over plain HTTP and access token stored in script-readable cookie and localStorage"
workaround: None known.
---

# Admin panel served over plain HTTP and access token stored in script-readable cookie and localStorage

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | High |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-01` in `../features/karaz-backoffice.md` |

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
| Reproducible | Always (configuration) |

## Summary

The admin panel and API run on plain HTTP, so the login password and bearer token cross the network unencrypted. After login the token is stored in a cookie `karaz_access_token` with `HttpOnly=false` and `Secure=false`, and in localStorage key `karaz-auth`. Any XSS or any network observer can take over an admin session. The account `admin` also uses a weak default password on a public IP.

## Steps to reproduce

1. Open `http://169.58.165.26/KarazBackoffice/login`. There is no HTTPS and no redirect to HTTPS.
2. Log in as `admin`.
3. DevTools → Application → Cookies: `karaz_access_token` has HttpOnly ☐ and Secure ☐.
4. DevTools → Local Storage: key `karaz-auth` holds `state.accessToken`.

## Expected

TLS on all endpoints (HTTP→HTTPS redirect, HSTS). Token only in an `HttpOnly; Secure; SameSite` cookie or in memory, never in JS-readable storage. Source: OWASP ASVS V3/V8 baseline for admin consoles.

## Actual

HTTP only. Token readable from `document.cookie` and `localStorage`.

## Layer

| Layer | Finding |
|---|---|
| UI | Token persisted client-side in two JS-readable places |
| Network | All traffic `http://`, incl. `POST /KarazApi/api/Users/Login` |

**Classification:** Defect

## Impact

All admins on any shared network. **High**, not Critical: exploitation needs a network position or an XSS. No active XSS was found (a store-name payload rendered inert).

## Evidence

Cookie flags observed via Playwright `context.cookies()`. Token values were deliberately not read or stored.

## Notes for the developer

Rotate the `admin` password as well: it is a guessable default and was shared in plain text in chat.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
