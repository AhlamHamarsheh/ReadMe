---
title: "[FE][Karaz][Admin][Global] - Server validation messages are replaced by a generic 'Request failed with status code 400' toast"
team: FE
severity: Low
classification: UI/UX
project_text: KARAZ
flow: Settings
scenario: "F-26 from Karaz admin exploration 2026-09-23"
summary: "Server validation messages are replaced by a generic 'Request failed with status code 400' toast"
workaround: None known.
---

# Server validation messages are replaced by a generic 'Request failed with status code 400' toast

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Low |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-26` in `../features/karaz-backoffice.md` |

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
| Reproducible | Always (4 screens) |

## Summary

The API returns clear messages (`Store type name already exists`, `Product type name already exists`, `Store name is required`, `Store name maximum length is 200 characters`), but the admin UI shows only the raw Axios text `Request failed with status code 400`. The admin can't tell what went wrong.

## Steps to reproduce

1. Settings › Store Types: add `QA-StoreType-0923` twice (or the lowercase version).
2. Settings › Product Types: add `QA-ProductType-0923` twice.
3. Store Details (test store #5): clear the Store Name, then Save.

## Expected

The toast shows `error.message` (or the per-field `error.details`) from the response.

## Actual

The toast shows `Request failed with status code 400`. On Store Details it also shows a success toast (see bug `karaz-inline-save-400-success`).

## Layer

| Layer | Finding |
|---|---|
| UI | The error handler shows `AxiosError.message` instead of `response.data.message` |
| API | Messages are correct. One inconsistency: the product-type duplicate returns `details: {"": [...]}` with an empty key |

**Classification:** Defect

## Impact

Every create/update form. **Low**: the operation is correctly rejected, only the feedback is poor.

## Evidence

Response bodies 2026-09-23 (test-owned records only).

## Notes for the developer

This can be fixed once in the shared API client interceptor.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
