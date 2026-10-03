---
title: "[BE][Karaz][Admin][Attachments] - Attachment download endpoint accepts unauthenticated requests with sequential base64 ids"
team: BE
severity: Medium
classification: Security
project_text: KARAZ
flow: Attachments
scenario: "F-05 from Karaz admin exploration 2026-09-23"
summary: "Attachment download endpoint accepts unauthenticated requests with sequential base64 ids"
workaround: None known.
---

# Attachment download endpoint accepts unauthenticated requests with sequential base64 ids

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-05` in `../features/karaz-backoffice.md` |

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

`/KarazApi/api/attachment/download/{id}` processes requests that carry no bearer token: it reaches the file lookup (500 File not found) instead of returning 401, while other endpoints such as `GetStoreProducts` return 401 for the same request. The ids are base64 of sequential integers (`MjE` = 21, `Mg` = 2), so anyone can enumerate every attachment, including attachment type 2 *User Image*.

## Steps to reproduce

1. With no Authorization header: `GET /KarazApi/api/StoreProducts/GetStoreProducts?Skip=0&Take=12` → **401** (control).
2. With no Authorization header: `GET /KarazApi/api/attachment/download/MjE` → **500 File not found** (the handler ran).

## Expected

401 for unauthenticated requests. If product images are meant to be public: ids that can't be guessed, plus an access check per attachment type (user images must never be public).

## Actual

There is no auth check before the lookup, and the ids are trivial to enumerate.

## Layer

| Layer | Finding |
|---|---|
| API | No `[Authorize]` or access policy on the attachment controller |

**Classification:** Defect (inferred: re-verify once files exist)

## Impact

Could expose user profile images and any future sensitive attachments. **Medium**. This is inferred from the 500-vs-401 difference: no file could actually be downloaded because the files are missing (see bug `karaz-attachment-images-broken`).

## Evidence

Status codes from a same-origin fetch with no bearer header, 2026-09-23.

## Notes for the developer

Re-verify once the images bug is fixed and files exist on disk.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
