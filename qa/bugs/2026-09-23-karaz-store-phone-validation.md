---
title: "[FE & BE][Karaz][Admin][Add Store] - Phone number has no format validation and defaults to +972 instead of +970"
team: FE & BE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Stores
scenario: "F-09 from Karaz admin exploration 2026-09-23"
summary: "Phone number has no format validation and defaults to +972 instead of +970"
workaround: None known.
---

# Phone number has no format validation and defaults to +972 instead of +970

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-09` in `../features/karaz-backoffice.md` |

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
| Reproducible | Always |

## Summary

Add Store accepts any phone value on the client: `abc`, `1`, 20 digits, or a number that already includes `+970`. The country code defaults to **+972 (IL)**, although Palestine (+970) has `SORT_ORDER` 1 and every store is in Palestine. Existing data shows the result: store 4 is saved as `+972 [redacted]`, which isn't a valid mobile number.

## Steps to reproduce

1. On `/stores`, click Add Store.
2. Enter `abc` as the phone and click Save. Leave Country empty so nothing is created.
3. No phone error appears; only the other required fields are flagged. Repeat with `1`, `12345678901234567890` and `+970599000000`.
4. Note that the country-code selector defaults to `+972 (IL)`.

## Expected

Digits only, with a length that fits the country (a Palestinian mobile is 9 digits starting with 5), and no country code typed into the field. The default code is the first by `SORT_ORDER` (+970).

## Actual

Every value passes client validation, and the default is +972. **The server also accepts them:** `POST /Stores/UpdateStore` with `phoneNumber: "abc"` and then `"1"` on test store #5 returned **200** and saved the value. Email, by contrast, is validated on the server (`400 Invalid email address`).

## Layer

| Layer | Finding |
|---|---|
| UI | No pattern or length rule on `#phone`; the default code is the first alphabetically |
| API | `UpdateStore` / `AddStore` have no phone rule. Request `{id:5, phoneCountryId:1, phoneNumber:"abc"}` → 200 |

**Classification:** Defect

## Impact

Stores end up with invalid contact numbers, so SMS/OTP and customer contact fail. **Medium**.

## Evidence

Validation probe 2026-09-23 (the form was never submitted).

## Notes for the developer

Test store #5 was set back to `599000001` afterwards.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
