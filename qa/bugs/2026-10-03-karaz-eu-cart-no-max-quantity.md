---
title: "[BE][Karaz][Customer][Cart] - AddToCart accepts any quantity (100,000 units → 3,000,000 ILS cart)"
team: BE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Cart
scenario: "EU-08 from Karaz customer exploration 2026-10-03"
summary: "AddToCart accepts any quantity (100,000 units → 3,000,000 ILS cart)"
workaround: None known.
---

# AddToCart accepts any quantity (100,000 units → 3,000,000 ILS cart)

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-10-03 |
| **KB ref** | `EU-08` in `../features/karaz-enduser.md` |

## Environment

| | |
|---|---|
| Project | Karaz (multi-store e-commerce) |
| Environment | dev/test · `http://169.58.165.26` |
| Build | No build id exposed |
| Portal | Customer portal `/KarazEndUser` |
| Role / account | QA customer #4 (`0599999001`) |
| Browser | Chromium (Playwright MCP) · 1440×900 |
| First seen | 2026-10-03 |
| Reproducible | 1/1 |

## Summary

The cart API validates quantity > 0 but has no upper limit and no stock concept. A quantity of 100,000 was accepted, giving a cart line of 3,000,000 ILS, which could then be checked out as an order the store must handle.

## Steps to reproduce

1. As a logged-in customer: `POST /KarazCustomersApi/api/Carts/AddToCart` with `{productId:2, quantity:100000, fieldValues:[{fieldId:3, optionId:16}]}`.
2. Open السلة.

## Expected

A sensible maximum per line (and/or stock check) with a clear 400 message.

## Actual

`200 {cartItemId:10, quantity:100000, totalPrice:3000000}`. Cart total `3000030.00 ILS` (no thousands separators). The line was removed again after the test.

## Layer

| Layer | Finding |
|---|---|
| API | No max-quantity rule |
| UI | +/- buttons have no upper bound either |

**Classification:** Defect

## Impact

Junk or abusive orders reaching stores. **Medium**.

## Evidence

Request/response 2026-10-03 (cart #8, item #10, since removed).

## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
