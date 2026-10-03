---
title: "[BE][Karaz][Admin][Attachments] - Image URLs miss the /KarazApi prefix (404) and the correct path returns 500 for a missing file"
team: BE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Products
scenario: "F-04 from Karaz admin exploration 2026-09-23"
summary: "Image URLs miss the /KarazApi prefix (404) and the correct path returns 500 for a missing file"
workaround: None known.
---

# Image URLs miss the /KarazApi prefix (404) and the correct path returns 500 for a missing file

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-04` in `../features/karaz-backoffice.md` |

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

Every image the API returns is broken. The generated `imageUrl` lacks the `/KarazApi` virtual directory, so it returns 404. The correct path returns **500** `File not found on server.`: the DB attachment row exists but the file is missing from disk, and a missing resource is reported as a server error.

## Steps to reproduce

1. Open *Stores › Product Tracking* (also Products Overview and Settings › Product Types).
2. Images are broken; the console shows `404 http://169.58.165.26/api/attachment/download/MjE`.
3. `GET http://169.58.165.26/KarazApi/api/attachment/download/MjE` (attachment id 21).

## Expected

`imageUrl` resolves to a working download under `/KarazApi/api/...` (or is a relative URL). A missing file returns 404, not 500.

## Actual

Step 2: 404 (wrong base path). Step 3: `500 {message: File not found on server.}`. Affected: product 2, product type 3 (`Mg`), store type 2 (`NjE`).

## Layer

| Layer | Finding |
|---|---|
| API | URL builder uses the host root instead of the app base path |
| Env/Data | The file for attachment 21 is missing from storage (a deploy may not have kept the uploads) |

**Classification:** Defect

## Impact

All product images in the admin panel, and likely in the customer app. No workaround. **Medium**: visible, but core flows still work.

## Evidence

Console log and fetch results 2026-09-23; screenshots `qa/evidence/karaz/add-product-*.png`.

## Notes for the developer

Two separate fixes: (a) include the base path when generating URLs, (b) keep uploads in persistent storage and return 404 for missing files. Related: bug `karaz-placeholder-image-loop`.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
