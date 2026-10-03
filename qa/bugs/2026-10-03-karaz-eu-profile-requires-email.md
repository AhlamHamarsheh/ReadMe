---
title: "[FE & BE][Karaz][Customer][Profile] - Profile edits are blocked until an email is added, but signup never asks for email"
team: FE & BE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Profile
scenario: "EU-07 from Karaz customer exploration 2026-10-03"
summary: "Profile edits are blocked until an email is added, but signup never asks for email"
workaround: Add any valid email first, then edit the other fields.
---

# Profile edits are blocked until an email is added, but signup never asks for email

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-10-03 |
| **KB ref** | `EU-07` in `../features/karaz-enduser.md` |

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

Signup doesn't collect an email, but the profile form makes email mandatory. A new customer who tries to change their name, phone or address gets "يرجى تعبئة الاسم والبريد والجوال" (fill in name, email and phone) and can't save anything until they first add an email.

## Steps to reproduce

1. Register a new customer (signup has no email field).
2. Profile → تعديل → change the name → حفظ.

## Expected

Email is optional in the profile (because it's optional at signup), or signup collects it.

## Actual

Client blocks the save with `يرجى تعبئة الاسم والبريد والجوال`. It works only after an email is added.

## Layer

| Layer | Finding |
|---|---|
| UI | Profile form treats email as required |
| Data | New customers have `email: null` |

**Classification:** Defect

## Impact

Every new customer who wants to update their address before ordering. **Medium**.

## Evidence

Profile edit attempts on customer #4, 2026-10-03.

## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
