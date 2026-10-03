---
title: "[BE][Karaz][Customer][Checkout] - Orders/Checkout takes ~14 seconds to respond"
team: BE
severity: Medium
classification: Performance
project_text: KARAZ
flow: Checkout
scenario: "EU-04 from Karaz customer exploration 2026-10-03"
summary: "Orders/Checkout takes ~14 seconds to respond"
workaround: None known.
---

# Orders/Checkout takes ~14 seconds to respond

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-10-03 |
| **KB ref** | `EU-04` in `../features/karaz-enduser.md` |

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

Placing a 1-item order took **13.7 s** server time (`POST /Orders/Checkout`). Other calls on the same server answer in 90–250 ms. During that time the customer sees only a spinner, which invites double submits or abandoned checkouts.

## Steps to reproduce

1. Log in as a customer and add 1 item to the cart (product 2, size M).
2. Cart → enter an address → إتمام الطلب → تأكيد الطلب.
3. Watch the duration of `POST /Orders/Checkout` in DevTools.

## Expected

Checkout responds within ~1–2 s. Side effects such as notifications (SignalR/Firebase) run asynchronously.

## Actual

`POST /Orders/Checkout` → 200 after **13,689 ms** (order #8).

## Layer

| Layer | Finding |
|---|---|
| API | Slow checkout; likely synchronous work after the order insert (the admin notification was created at 13:36:29, the order at 13:36:28) — *assumption* |

**Classification:** Defect

## Impact

Every order. Risk of abandoned carts and repeat clicks. **Medium**.

## Evidence

Network timing, 2026-10-03 11:36 UTC.

## Notes for the developer

Measured once. Re-measure under normal load before prioritising.

## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
