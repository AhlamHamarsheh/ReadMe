---
title: "[FE & BE][Karaz][Customer][Orders] - Customer cannot open an order, see its items/address, track delivery or cancel it"
team: FE & BE
severity: Medium
classification: Functional
project_text: KARAZ
flow: Orders
scenario: "EU-09 from Karaz customer exploration 2026-10-03"
summary: "Customer cannot open an order, see its items/address, track delivery or cancel it"
workaround: None known.
---

# Customer cannot open an order, see its items/address, track delivery or cancel it

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-10-03 |
| **KB ref** | `EU-09` in `../features/karaz-enduser.md` |

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

My Orders lists orders as cards (number, date, total, item count, status), but the cards can't be clicked. There's no order details view, no delivery tracking (the spec has delivery states Ready / In Transit / Delivered / Failed), and no way for the customer to cancel a New order. Only an admin can cancel.

## Steps to reproduce

1. Place an order (order #8).
2. طلباتي → الحالية → click the order card.

## Expected

An order details view (items with options, address, totals, status history, delivery status), and a cancel action while the status is New. Source: spec `CUSTOMER_ORDER_ITEMS_TB`, `ORDER_DELIVERIES_TB`, delivery states 8–11.

## Actual

Clicking does nothing. The API map has only `Orders/GetOrders` and `Orders/Checkout`.

## Layer

| Layer | Finding |
|---|---|
| UI | No details screen |
| API | No customer order-details / cancel endpoint |

**Classification:** Missing feature / spec gap: confirm scope with PO

## Impact

Customers can't check what they ordered or where it is. **Medium**.

## Evidence

Orders screen and bundle endpoint map, 2026-10-03.

## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
