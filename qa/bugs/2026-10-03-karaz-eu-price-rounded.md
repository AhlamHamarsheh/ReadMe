---
title: "[FE][Karaz][Customer][Products] - Product cards and favorites show rounded prices (99.99 shown as 100 ILS)"
team: FE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Products
scenario: "EU-03 from Karaz customer exploration 2026-10-03"
summary: "Product cards and favorites show rounded prices (99.99 shown as 100 ILS)"
workaround: None known.
---

# Product cards and favorites show rounded prices (99.99 shown as 100 ILS)

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-10-03 |
| **KB ref** | `EU-03` in `../features/karaz-enduser.md` |

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
| Reproducible | Always |

## Summary

Product list cards and the Favorites list round prices to whole numbers. The blouse (product 3) costs **99.99 ILS** in the API but is shown as **100 ILS**. The cart and checkout correctly use 99.99, so the customer sees a different price before and after adding to cart.

## Steps to reproduce

1. Log in as a customer → المنتجات.
2. Find بلوزة اوفر سايز (store رونق): the card shows `100 ILS`.
3. Add it to favorites → المفضلة: it also shows `100 ILS`.
4. Compare with `GET /Products/GetProducts` → `price: 99.99`.

## Expected

Prices shown with the currency's decimal places (`DECIMAL_PLACES` = 2 for ILS): `99.99 ILS`, the same as on product details and in the cart.

## Actual

`100 ILS` on the cards and in favorites; `30.00 ILS` style (2 decimals) on product details and in the cart.

## Layer

| Layer | Finding |
|---|---|
| UI | Card/favorite price formatter rounds to integer |
| API | Correct (`99.99`) |

**Classification:** Defect

## Impact

Every product with a fractional price. Customers see a price that doesn't match the cart. Consumer-protection risk. **Medium**.

## Evidence

`GET /KarazCustomersApi/api/Products/GetProducts?Skip=0&Take=12` and `GET /FavoriteProducts/GetFavoriteProducts` responses vs rendered text, 2026-10-03.

## Notes for the developer

The admin dashboard has the same rounding (299.97 → 300): see admin bug `karaz-dashboard-revenue-currency`.

## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
