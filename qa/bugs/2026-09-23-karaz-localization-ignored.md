---
title: "[FE & BE][Karaz][Admin][Localization] - API ignores Accept-Language; entity names stay single-language in AR and EN"
team: FE & BE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Localization
scenario: "F-08 from Karaz admin exploration 2026-09-23"
summary: "API ignores Accept-Language; entity names stay single-language in AR and EN"
workaround: None known.
---

# API ignores Accept-Language; entity names stay single-language in AR and EN

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-08` in `../features/karaz-backoffice.md` |

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

Switching to Arabic translates the interface and turns on RTL, and the client sends `Accept-Language: AR`, but the API still returns one fixed name per record. Examples:

- **Store type 1** shows `Fashion Store` in Arabic mode, although `storeTypeNa` = متجر أزياء exists. In English mode, Settings › Store Types shows the Arabic name.
- **Cities** are Arabic-only and **states** English-only, in both modes.
- **Notifications** are Arabic-only in English mode.
- **Forms** only capture the `_Na` name, so `_Fo` is never set.

## Steps to reproduce

1. In EN, `/stores` shows type `Fashion Store`, while `/settings/store-types` shows the same type as متجر أزياء.
2. Switch to AR: `/stores` still shows `Fashion Store` and the states `Jenin` and `Hebron`.
3. Inspect the `GET /Stores/GetStores` request: the header is `accept-language: AR`, but the response has `storeType: Fashion Store`.

## Expected

Record names follow the UI language (`_Na` in AR, `_Fo` in EN) consistently on every screen, and forms capture both names. Source: the ER doc defines `*_NA` / `*_FO` columns on every constants table (BR-KZ-12).

## Actual

The language header is ignored, screens disagree with each other, and the `_Fo` name is null for new records (the AddStore payload has no `storeNameFo`).

## Layer

| Layer | Finding |
|---|---|
| API | Name selection ignores the requested language |
| UI | Forms have no `_Fo` inputs; the settings lists show the `_Na` name |
| Data | Many rows have identical `_Na` and `_Fo` values (e.g. categories) |

**Classification:** Defect / possible spec gap: confirm with PO

## Impact

Affects every bilingual user. **Medium**: usability and consistency problem, no data loss.

## Evidence

Request headers (auth redacted) and responses 2026-09-23; `qa/evidence/karaz/stores-ar.png`.

## Notes for the developer

This may partly be a spec gap: confirm the intended language behaviour with the PO.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
