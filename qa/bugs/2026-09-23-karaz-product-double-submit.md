---
title: "[FE & BE][Karaz][Admin][Add Store Products] - Double-clicking Add Product creates duplicate products"
team: FE & BE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Products
scenario: "F-17 from Karaz admin exploration 2026-09-23"
summary: "Double-clicking Add Product creates duplicate products"
workaround: None known.
---

# Double-clicking Add Product creates duplicate products

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-17` in `../features/karaz-backoffice.md` |

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
| Reproducible | 1/1 (matches existing data: 4 identical products on store 4, 2 on store 3) |

## Summary

The Add Product button isn't disabled while the request is in flight, and the server has no duplicate check. A double-click sends two `CreateStoreProduct` requests and creates two identical products. Existing data shows this already happens in normal use: store 4 has four identical products (ids 6–9, created within 3 minutes) and store 3 has two.

## Steps to reproduce

1. Open `/stores/add-products` and fill in a valid product: store #5, name `QA-DoubleSubmit`, category حذاء سبور, type أحذية, price 5, Inactive.
2. Double-click **Add Product**.

## Expected

Exactly one product is created. The button is disabled or shows a spinner until the response arrives, and ideally the server rejects a second identical product for the same store (or uses an idempotency key).

## Actual

Two POSTs and two success toasts; products **#13 and #14** created with identical data.

## Layer

| Layer | Finding |
|---|---|
| UI | Submit not locked while pending |
| API | No uniqueness check on (store, name) |

**Classification:** Defect

## Impact

Duplicate catalogue entries for customers and skewed product counts. **Medium**: this already happened in real data.

## Evidence

Request count 2 for a single double-click; `GET /StoreProducts/GetStoreProducts?storeId=5` lists ids 13 and 14.

## Notes for the developer

Check the other create forms (Add Store, store type, field): none of their buttons appeared to lock either.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
