---
title: "[BE][Karaz][Customer][API] - Business-rule errors return HTTP 500 instead of 400/404/409"
team: BE
severity: Low
classification: Functional
project_text: KARAZ
flow: API
scenario: "EU-10 from Karaz customer exploration 2026-10-03"
summary: "Business-rule errors return HTTP 500 instead of 400/404/409"
workaround: None known.
---

# Business-rule errors return HTTP 500 instead of 400/404/409

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Low |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-10-03 |
| **KB ref** | `EU-10` in `../features/karaz-enduser.md` |

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

Several expected, user-caused errors are returned as **500 Internal Server Error**, which hides real server faults in monitoring and can trigger generic error handling in clients.

## Steps to reproduce

1. `POST /Orders/Checkout` with an already-ordered or non-existent `cartId` → 500 `Active cart not found`.
2. `POST /Customers/UpdateProfile` with a mobile already used by another customer → 500 `رقم الجوال مسجل مسبقاً`.
3. `POST /Customers/ChangePassword` with a wrong current password → 500 `كلمة المرور الحالية غير صحيحة`.

## Expected

404 (cart not found), 409 (duplicate mobile), 400 (wrong current password).

## Actual

500 in all three cases (and `details: null`).

## Layer

| Layer | Finding |
|---|---|
| API | Business exceptions mapped to 500 |

**Classification:** Defect

## Impact

Monitoring noise, and clients can't tell user errors from outages. **Low**.

## Evidence

Responses 2026-10-03 (customer #4 only).

## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
