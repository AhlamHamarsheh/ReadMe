---
title: "[FE & BE][Karaz][Admin][Dashboard] - Revenue shown as SAR but computed from unconverted ILS order totals"
team: FE & BE
severity: High
classification: Functional
project_text: KARAZ
flow: Dashboard
scenario: "F-02 from Karaz admin exploration 2026-09-23"
summary: "Revenue shown as SAR but computed from unconverted ILS order totals"
workaround: None known.
---

# Revenue shown as SAR but computed from unconverted ILS order totals

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | High |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-02` in `../features/karaz-backoffice.md` |

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

Every order in the system is in ILS (`currencyCode: ILS`). The dashboard sums those raw ILS amounts, performs no conversion to the base currency (USD, `IS_BASE_CURRENCY=1`), and labels the result **SAR**. Admins read a wrong currency and a wrong amount on the main business screen.

## Steps to reproduce

1. Log in as `admin` and open `/dashboard`.
2. Read *Top Performing Stores*: store 2 shows `SAR 300`, store 1 shows `SAR 90`. The *Monthly Orders Revenue* chart peaks in July.
3. Open *Stores › Product Tracking*: the same orders show as ₪30, ₪99.99, ₪199.98, and so on.

## Expected

Revenue shown in the base currency (USD) converted with `RATE_TO_BASE` (ILS = 0.27), or in the orders' own currency with the correct symbol, but never in a currency no order uses. Source: BR-KZ-09 (`C_CURRENCIES_TB`: USD is the base, ILS rate 0.27).

## Actual

`GET /Dashboard/GetOverview` returns `topStores[].revenue` = 299.97 and 90, and `monthlyRevenue` July = 389.97. That is exactly the ILS sum of the completed orders (30+30+30+99.99+199.98). The UI prefixes `SAR` and rounds 299.97 to 300.

## Layer

| Layer | Finding |
|---|---|
| API | GetOverview returns raw ILS sums with no currency field |
| UI | `SAR` label hard-coded; amounts rounded to integers |

**Classification:** Defect

## Impact

Every admin, on every dashboard load; financial reporting is misleading. **High**: wrong financial figures on the primary screen. Not Critical, because the underlying order data is intact.

## Evidence

Responses of `GET /KarazApi/api/Dashboard/GetOverview` and `GET /KarazApi/api/Orders/GetOrders?Skip=0&Take=10` (qa/evidence/karaz/).

## Notes for the developer

Status labels are also inconsistent: order status 6 shows as Completed on the dashboard but as Delivered in Product Tracking.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
