---
title: "[FE][Karaz][Admin][Products Overview] - Missing-image fallback requests dead via.placeholder.com in an endless loop"
team: FE
severity: Low
classification: Performance
project_text: KARAZ
flow: Products Overview
scenario: "F-11 from Karaz admin exploration 2026-09-23"
summary: "Missing-image fallback requests dead via.placeholder.com in an endless loop"
workaround: None known.
---

# Missing-image fallback requests dead via.placeholder.com in an endless loop

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Low |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-11` in `../features/karaz-backoffice.md` |

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

When a product image fails to load, the `onerror` fallback sets `src` to `https://via.placeholder.com/...`. That service no longer resolves, so the fallback fails too and triggers `onerror` again, forever: about 1.7 failed requests per second for each open tab, flooding the console.

## Steps to reproduce

1. Open `/stores/products-overview` (products have missing or broken images).
2. Watch the console or network panel for 10 seconds.

## Expected

Fall back to a placeholder bundled with the app, and stop handling `onerror` after the first fallback.

## Actual

The console repeats `ERR_CONNECTION_CLOSED @ https://via.placeholder.com/300x200/...`. The error count went from 54 to 71 in 10 seconds and keeps rising.

## Layer

| Layer | Finding |
|---|---|
| UI | The onerror handler re-assigns the external URL with no guard |

**Classification:** Defect

## Impact

Wastes bandwidth and CPU on every visit, and the noisy console hides real errors. **Low**: nothing stops working.

## Evidence

Console log `.playwright-mcp/console-2026-09-23T09-12-32-470Z.log`.

## Notes for the developer

Made worse by bug `karaz-attachment-images-broken`.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
