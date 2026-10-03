---
title: "[BE][Karaz][Admin][Add Store Products] - Price 0.001 saved as 0 and oversized price leaks raw ORA-01438 error"
team: BE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Products
scenario: "F-25 from Karaz admin exploration 2026-09-23"
summary: "Price 0.001 saved as 0 and oversized price leaks raw ORA-01438 error"
workaround: None known.
---

# Price 0.001 saved as 0 and oversized price leaks raw ORA-01438 error

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-25` in `../features/karaz-backoffice.md` |

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
| Reproducible | 1/1 each case |

## Summary

Two server-side gaps on `CreateStoreProduct`:

1. **Zero price.** The client blocks 0 and negative prices, but `0.001` passes the client and the server **rounds it to 0 and saves it**, so a product with price 0 now exists.
2. **Oversized price.** `99999999999999` is not validated. The Oracle insert fails, and the API returns the raw database error `ORA-01438: value larger than specified precision` with *See the inner exception for details*, which the UI shows to the admin in a toast.

## Steps to reproduce

1. Open `/stores/add-products` and select store `QA-Karaz-Store-0923` (#5), category حذاء سبور, type أحذية, status Inactive.
2. Enter name `QA-Price-0.001` and price `0.001`, then click Add Product.
3. Products Overview → filter by store #5: product #11 shows `$0`, and the API returns `price: 0`.
4. Repeat with price `99999999999999`.

## Expected

The server rejects prices ≤ 0, prices with more decimals than the currency allows (`DECIMAL_PLACES`, 2 for USD), and values above the column precision, returning a clear 400 validation message. Internal exception text must never reach the client. Source: the client's own rule "Please enter a valid price" for 0/negative; `C_CURRENCIES_TB.DECIMAL_PLACES`.

## Actual

Case 1: 200, product #11 stored with price 0. Case 2: `400 {message: An error occurred while saving the entity changes. See the inner exception for details., error.details: ORA-01438: value larger than specified precision ...}`, shown verbatim in the toast.

## Layer

| Layer | Finding |
|---|---|
| API | No price rules in the request validator; the EF/Oracle exception is caught and returned to the client |
| Data | Product #11 has price 0 (test-owned, hidden) |

**Classification:** Defect

## Impact

Free (zero-price) products can be created via 0.001 or a direct API call. The DB error leaks schema and database information. **Medium**.

## Evidence

Request/response log 2026-09-23 (multipart `Price` field), test-owned products #11 and the failed insert.

## Notes for the developer

The failed insert used up sequence value 12. That is harmless, but it shows the insert got as far as the database.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
