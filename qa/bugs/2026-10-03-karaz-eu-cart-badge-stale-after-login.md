---
title: "[FE][Karaz][Customer][Cart] - Cart badge shows 0 after login until the cart page is opened"
team: FE
severity: Low
classification: UI/UX
project_text: KARAZ
flow: Cart
scenario: "EU-11 from Karaz customer exploration 2026-10-03"
summary: "Cart badge shows 0 after login until the cart page is opened"
workaround: None known.
---

# Cart badge shows 0 after login until the cart page is opened

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Low |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-10-03 |
| **KB ref** | `EU-11` in `../features/karaz-enduser.md` |

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

The app calls `GET /Carts/GetCart` on the login screen (twice, 401 Unauthorized) and doesn't refetch after a successful login. A customer whose cart already has items sees `سلتي 0` until they open the cart page.

## Steps to reproduce

1. As a customer, add an item to the cart, then log out.
2. Log back in: the sidebar shows `سلتي 0`.
3. Open سلتي: the item is there and the badge changes to 1.

## Expected

Fetch the cart after login (and skip the pre-login calls).

## Actual

Badge 0 until the cart page is opened. Two 401 `GetCart` calls on every visit to the login page.

## Layer

| Layer | Finding |
|---|---|
| UI | Query not invalidated on auth change |

**Classification:** Defect

## Impact

Customers think their cart is empty. **Low**.

## Evidence

Customer #4, cart #9, 2026-10-03.

## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
