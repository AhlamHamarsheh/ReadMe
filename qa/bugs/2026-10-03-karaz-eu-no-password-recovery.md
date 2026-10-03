---
title: "[FE & BE][Karaz][Customer][Login] - No forgot-password / password-recovery flow"
team: FE & BE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Login
scenario: "EU-06 from Karaz customer exploration 2026-10-03"
summary: "No forgot-password / password-recovery flow"
workaround: None known.
---

# No forgot-password / password-recovery flow

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-10-03 |
| **KB ref** | `EU-06` in `../features/karaz-enduser.md` |

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

The customer login screen has no "Forgot password" link, and the client bundle has no reset endpoint. A customer who forgets their password has no way back into their account and can't re-register, because the number is already taken. The spec defines OTP purpose `PASSWORD_RESET` (15 min expiry, 5 attempts).

## Steps to reproduce

1. Open `http://169.58.165.26/KarazEndUser/`.
2. Look for any password-recovery option on the login form.

## Expected

A "Forgot password?" link → enter mobile → OTP (`PASSWORD_RESET`) → set a new password.

## Actual

No link, no screen, no endpoint.

## Layer

| Layer | Finding |
|---|---|
| UI | Missing screen |
| API | No reset endpoint in the client's API map |

**Classification:** Missing feature (spec defines it)

## Impact

Customers who forget their password are locked out for good. **Medium**: support burden and lost customers.

## Evidence

Login page and bundle endpoint map, 2026-10-03.

## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
