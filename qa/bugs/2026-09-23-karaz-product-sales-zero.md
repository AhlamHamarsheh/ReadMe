---
title: "[BE][Karaz][Admin][Products Overview] - salesCount and revenue are 0 for all products despite completed orders"
team: BE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Products Overview
scenario: "F-06 from Karaz admin exploration 2026-09-23"
summary: "salesCount and revenue are 0 for all products despite completed orders"
workaround: None known.
---

# salesCount and revenue are 0 for all products despite completed orders

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-06` in `../features/karaz-backoffice.md` |

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

Products Overview shows *Total Sales 0 / Total Revenue ₪0*, and every product card reads `0 sales`. Completed orders do exist: the dashboard's Top Stores and Product Tracking both show them. The per-product totals are not being calculated.

## Steps to reproduce

1. Open `/stores/products-overview`: every card shows `0 sales` and the header shows Total Revenue `₪0`.
2. Open `/stores/product-tracking`: orders 4, 5 and 6 (product 2, qty 1 each) and orders 2 and 3 (product 3, qty 2 and 1) are all Completed.

## Expected

Product 2: 3 sales / ₪90. Product 3: 3 sales / ₪299.97. Overview totals: 6 sales / ₪389.97, matching dashboard `topStores`.

## Actual

`GET /StoreProducts/GetStoreProducts?Skip=0&Take=12` returns `salesCount: 0, revenue: 0` for every item, and `overview.totalSales: 0, totalRevenue: 0`.

## Layer

| Layer | Finding |
|---|---|
| API | The aggregation returns 0. Possible cause (*assumption*): it filters on a status that is never set, e.g. delivery Delivered=10 instead of order Completed=6 |

**Classification:** Defect

## Impact

Admin product-performance reporting is unusable. **Medium**: reporting only; the orders themselves are correct.

## Evidence

`qa/evidence/karaz/store-products.json` (response body).

## Notes for the developer

The dashboard calculates revenue per store correctly, so compare the two queries.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
