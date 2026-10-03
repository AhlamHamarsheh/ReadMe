---
title: "[BE][Karaz][Customer][Account] - Existing session stays valid after password change; logout is client-only"
team: BE
severity: Medium
classification: Security
project_text: KARAZ
flow: Account
scenario: "EU-05 from Karaz customer exploration 2026-10-03"
summary: "Existing session stays valid after password change; logout is client-only"
workaround: None known.
---

# Existing session stays valid after password change; logout is client-only

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-10-03 |
| **KB ref** | `EU-05` in `../features/karaz-enduser.md` |

## Environment

| | |
|---|---|
| Project | Karaz (multi-store e-commerce) |
| Environment | dev/test · `http://169.58.165.26` |
| Build | No build id exposed |
| Portal | Customer portal `/KarazEndUser` |
| Role / account | QA customer #4 (`0599999001`) |
| Browser | Chromium (Playwright MCP) · 1440×900 |
| First seen | 2026-10-03 |
| Reproducible | Always |

## Summary

After a successful password change, the same bearer token keeps working: the very next authenticated call (changing the password back) succeeded with it. Logout makes no server call and only clears the browser state. A stolen token therefore survives both a password change and a logout. The token is also stored in a cookie readable by scripts (`karaz_customer_access_token`, HttpOnly=false, Secure=false) over plain HTTP.

## Steps to reproduce

1. Log in as a customer.
2. Profile → تغيير كلمة المرور: change it to a new valid password → success.
3. Without logging in again, change it back → success with the same token.
4. Log out from the avatar menu: no request is sent to the API.

## Expected

Changing the password invalidates all other sessions (or at least requires a new login), and logout revokes the token on the server. Tokens live in HttpOnly/Secure cookies on HTTPS.

## Actual

The token stays valid after the password change. Logout is client-only. The cookie isn't HttpOnly or Secure.

## Layer

| Layer | Finding |
|---|---|
| API | No token revocation / no security-stamp check |
| UI | Logout only clears local state |

**Classification:** Defect

## Impact

Account takeover persists after the victim resets their password. **Medium** (needs a stolen token first).

## Evidence

ChangePassword 200 → 200 with the same session, 2026-10-03. No API request on logout.

## Notes for the developer

The admin portal behaves the same way (F-01, F-12).

## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
