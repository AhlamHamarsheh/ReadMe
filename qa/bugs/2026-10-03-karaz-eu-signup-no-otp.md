---
title: "[BE][Karaz][Customer][Signup] - Account is created without verifying the mobile number (no OTP)"
team: BE
severity: High
classification: Security
project_text: KARAZ
flow: Signup
scenario: "EU-01 from Karaz customer exploration 2026-10-03"
summary: "Account is created without verifying the mobile number (no OTP)"
workaround: None known.
---

# Account is created without verifying the mobile number (no OTP)

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | High |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-10-03 |
| **KB ref** | `EU-01` in `../features/karaz-enduser.md` |

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

`POST /Customers/Subscribe` creates an active customer immediately, with no OTP or any other proof that the person owns the mobile number. Anyone can register any number, including someone else's. The real owner is then blocked from registering ("Mobile number is already registered"), and orders and notifications go to an account they don't control. The spec defines an OTP purpose `SIGNUP` (10 min expiry, 3 attempts), but the client bundle contains no OTP or verification endpoint at all.

## Steps to reproduce

1. Open `http://169.58.165.26/KarazEndUser/` and click إنشاء حساب.
2. Fill: name `QA Tester Karaz`, mobile `0599999001`, a valid password, country فلسطين / state جنين / city جنين, and an address.
3. Click إنشاء حساب.
4. Log in straight away with the same number and password.

## Expected

An OTP is sent to the number, and the account is activated only after the code is verified. Source: `C_OTP_PURPOSES_TB` row `SIGNUP` (EXPIRES_MINUTES 10, MAX_ATTEMPTS 3); the ER doc lists `CUSTOMER_OTP_TB`.

## Actual

`200 {data:{id:4, userName:"970599999001", ...}}` and the account can log in immediately. The bundle's endpoint map has only `Customers/Login`, `Customers/Subscribe`, `ChangePassword`, `GetProfile` and `UpdateProfile`, with no OTP or verify endpoint.

## Layer

| Layer | Finding |
|---|---|
| API | Subscribe creates an active account with no verification step |
| UI | No OTP screen exists |

**Classification:** Defect

## Impact

Anyone can take over a phone number's identity, and real owners can be locked out. Combined with the no-rate-limit duplicate check, the signup endpoint can also be used to find out which numbers are registered. **High**: integrity of customer identity.

## Evidence

Request/response 2026-10-03 (customer #4, created for QA). Static review of `assets/index-DIQJPpoa.js`.

## Notes for the developer

The same gap applies to `ORDER_CONFIRM` (orders aren't confirmed by OTP) and `PASSWORD_RESET` (no reset flow exists). See bug `karaz-eu-no-password-recovery`.

## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
