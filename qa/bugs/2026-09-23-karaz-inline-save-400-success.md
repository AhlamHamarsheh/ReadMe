---
title: "[FE][Karaz][Admin][Store Details] - Failed inline save (400) shows a success toast and keeps the rejected value"
team: FE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Stores
scenario: "F-23 from Karaz admin exploration 2026-09-23"
summary: "Failed inline save (400) shows a success toast and keeps the rejected value"
workaround: None known.
---

# Failed inline save (400) shows a success toast and keeps the rejected value

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-23` in `../features/karaz-backoffice.md` |

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
| Reproducible | 3/3 |

## Summary

When `POST /Stores/UpdateStore` rejects an inline edit with 400, the UI shows a raw `Request failed with status code 400` toast **and** `Store Name updated successfully!`. It also keeps showing the rejected value. The admin can't tell whether the save worked and never sees the server's reason.

## Steps to reproduce

1. On `/stores`, open test store #5 `QA-Karaz-Store-0923`.
2. Click the pencil next to Store Name, then clear the field (or enter 3 spaces, or 600 characters), then Save.

## Expected

An error toast with the server's message (`Store name is required` / `Store name maximum length is 200 characters`) and no success toast. The editor stays open showing the error, and the header keeps the saved name.

## Actual

Two toasts appear: `Request failed with status code 400` and `Store Name updated successfully!`. The header shows a blank name, or the 600-character string, even though nothing was saved.

## Layer

| Layer | Finding |
|---|---|
| Network | `POST /KarazApi/api/Stores/UpdateStore` with body `{id:5, storeNameNa:'', ...}` → `400 {message: Store name is required, error.details.StoreNameNa: [...]}` (the server behaves correctly) |
| UI | The success handler runs regardless of status, and the server's message isn't shown |

**Classification:** Defect

## Impact

Every inline-edited field. **Medium**: the admin is told a change succeeded when it failed.

## Evidence

Request/response log 2026-09-23 (test-owned store #5 only).

## Notes for the developer

The server-side validation is correct, so the fix is client-side only.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
