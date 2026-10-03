# Karaz Customer Portal — QA Exploration Report

| | |
|---|---|
| **Date** | 2026-10-03 |
| **System** | Karaz multi-store e-commerce — Customer (end-user) portal |
| **Environment** | `http://169.58.165.26/KarazEndUser/` (API `/KarazCustomersApi/api`) |
| **Build** | Production Vite bundle `index-DIQJPpoa.js` (no build number exposed) |
| **Account used** | QA customer #4 "QA Tester Karaz", created during this session |
| **Method** | Manual exploratory testing with Playwright (Chromium, 1440×900 and 390×844 mobile), network and console inspection, review of the public JavaScript bundle. No database access. |
| **Status** | 25 findings · 10 bug reports drafted (`qa/bugs/2026-10-03-karaz-eu-*.md`) · none filed yet |

---

## 1. Summary

The customer portal's core purchase flow works end to end. A customer can sign up, log in, browse and search products, pick product options, manage the cart, place an order, and track it as New → Cancelled. The admin panel is notified in real time, and the customer is notified when the order is cancelled. The server validates most input well: password policy, name format, mobile prefix, duplicate numbers, cart options, and checkout address.

The main problems:

- **No phone verification at signup.** Anyone can register any mobile number, which locks the real owner out. The spec defines a signup OTP, but none is implemented.
- **No password recovery.** There's no "Forgot password" at all.
- **Prices are shown rounded** on product cards and in favorites (99.99 shown as 100 ILS).
- **Checkout is slow:** about 14 seconds for a single item.
- **Sessions survive a password change and logout**, and the token is stored insecurely over plain HTTP (same as the admin portal).
- **Order tracking is missing.** Customers can't open an order, see delivery status, or cancel.
- **Profile editing needs an email** that signup never asks for.

---

## 2. Scope and coverage

| Area | Coverage |
|---|---|
| Login | Empty fields, invalid formats, unregistered number, success, Remember me (present), logout |
| Signup | Client and server validation, password policy, name rules, duplicate mobile (3 variants), success |
| Products | Listing by type, type filters, search (Arabic/English, case, spaces, special characters), hidden-product exclusion |
| Product details | Dynamic fields (text, checkbox options), required options, add to cart |
| Cart | Add, +/−, delete with confirmation, totals, server-side quantity/option/product checks |
| Checkout | Address validation, confirmation dialog, order creation, server-side checks (repeat checkout, blank address, mismatched geography) |
| Orders | Current/previous tabs, status after admin cancellation |
| Favorites | Add, list, remove |
| Profile | View, edit (name, email, mobile), server validation |
| Change password | Mismatch, wrong current, weak, same as old, success and revert |
| Notifications | Customer and admin notifications for order #8 |
| Cross-portal | Order visible in admin Product Tracking; admin "Cancel order" action |
| Mobile | 390×844 layout, horizontal overflow |
| Static review | API endpoint map, runtime configuration, validation rules in the bundle |

### Not tested
| Item | Reason |
|---|---|
| Username enumeration and account lockout on login | Would need failed logins against a real customer's account |
| Checking out with another customer's cart ID | If the server were vulnerable, it would place a real order on that customer's account. Recommended as a dev test with two QA accounts. |
| "Out for delivery" and later delivery states | Would move a real store's order through delivery |
| Push notifications (Firebase), mark-as-read | Not exercised |
| Pagination | Only 8 products (page size 12) |

---

## 3. Findings

### 3.1 High

| ID | Finding | Bug report |
|---|---|---|
| EU-01 | **Signup has no phone verification.** `Customers/Subscribe` creates an active account immediately, with no OTP. Anyone can register any number, and the real owner then gets "Mobile number is already registered". The spec defines a `SIGNUP` OTP (10 min, 3 attempts), but the app has no OTP endpoint at all. | `karaz-eu-signup-no-otp` |
| EU-02 | **Plain HTTP, and the login token can be read by scripts** (cookie `karaz_customer_access_token`, not HttpOnly or Secure, plus localStorage). Same issue as the admin portal. | admin `karaz-http-token-storage` |

### 3.2 Medium

| ID | Finding | Bug report |
|---|---|---|
| EU-03 | **Rounded prices** on product cards and in favorites: a 99.99 ILS product shows as **100 ILS**. Product details and the cart show 99.99, so the price changes after adding to cart. | `karaz-eu-price-rounded` |
| EU-04 | **Checkout took 13.7 seconds** for a single item; other calls take 0.1–0.25 s. | `karaz-eu-checkout-slow` |
| EU-05 | **The session stays valid after a password change**, and logout doesn't contact the server. A stolen session survives both. | `karaz-eu-session-not-revoked` |
| EU-06 | **No forgot-password / recovery flow.** Customers who forget their password can't get back in and can't register again. The spec defines a `PASSWORD_RESET` OTP. | `karaz-eu-no-password-recovery` |
| EU-07 | **Profile edits require an email**, but signup doesn't collect one. New customers can't change their name, mobile or address until they add an email. | `karaz-eu-profile-requires-email` |
| EU-08 | **No maximum quantity:** 100,000 units was accepted, making a 3,000,000 ILS cart line. | `karaz-eu-cart-no-max-quantity` |
| EU-09 | **Customers can't open their orders.** There's no order details page, no delivery tracking and no customer cancel. | `karaz-eu-no-order-details` |
| EU-23 | **Product images are broken** (same cause as admin finding F-04). The fallback image comes from an external site. | admin `karaz-attachment-images-broken` |

### 3.3 Low

| ID | Finding |
|---|---|
| EU-10 | **Business errors return HTTP 500** instead of 400/404/409: "Active cart not found", duplicate mobile on profile update, wrong current password. (Bug report `karaz-eu-500-for-business-errors`.) |
| EU-11 | **Cart badge shows 0 after login** until the cart page is opened. The cart is requested before login (two 401 errors) and never requested again after login. (Bug report `karaz-eu-cart-badge-stale-after-login`.) |
| EU-12 | **Mixed languages.** English server messages appear in the Arabic UI ("Invalid username or password", "Full name must contain letters only", "Email format is invalid", "New password must be different from the current password"), and the field names "Brand" and "Color" are in English. |
| EU-13 | **Only the first error is shown.** On signup, password-policy errors are hidden behind the name error. On login, letters in the mobile number produce "Mobile number is required". Errors from earlier attempts stay on screen. |
| EU-14 | **A required option has no choices.** Product 2's required "Color" dropdown has no options, and the app silently skips it. |
| EU-15 | **The order confirmation dialog shows only the amount** (no address, items or store). A blank address still opens the dialog; the server then rejects it. |
| EU-16 | **The search placeholder always says "Search for shoes…"** whichever category is selected. |
| EU-17 | **"Settings" opens the Profile page.** There are no real settings and no language switch. |
| EU-18 | **No page addresses.** The URL never changes, so products, the cart and orders can't be linked to or bookmarked. The page is marked as English and left-to-right although the UI is Arabic, and it has two nested main regions. |
| EU-19 | **Mixed digit styles:** dates use Arabic-Indic digits (٣/١٠/٢٠٢٦) and prices use Latin digits. Large totals have no thousands separators (3000030.00). |
| EU-20 | **Test-only login code is in the live app.** The mock login and a demo-credentials panel are included in the production bundle (switched off). |
| EU-21 | **Mobile uniqueness ignores the country code.** The same local digits under +970 and +972 count as the same number. |
| EU-22 | **No notification when an order is placed.** The customer is only notified when it's cancelled. |
| EU-24 | **The empty cart has no "Start shopping" button.** On mobile, navigation is hidden behind the sidebar toggle. |
| EU-25 | **Spec features with no implementation:** payment method, order-confirmation OTP (`ORDER_CONFIRM`), delivery fees (always 0), delivery tracking. *Spec gap: confirm with PO.* |

### 3.4 Admin panel (discovered through this flow)
- **Order actions are now verified.** For a New order, the admin can choose **Out for delivery** or **Cancel order**. Cancel calls `Orders/UpdateOrderStatus` (status 7) and asks for confirmation. This couldn't be tested in the admin session because every order was already completed or cancelled.
- **Confusing cancel dialog:** its buttons are "**Cancel** / Confirm / Close", where "Cancel" means *keep* the order.

---

## 4. Verified working

| Area | Result |
|---|---|
| Password policy (signup and change) | ≥ 8 characters, uppercase, lowercase, number, complexity, enforced by the server |
| Name / mobile rules | Letters-only names; country-prefix check; leading 0 stripped; duplicates rejected |
| Catalogue | Hidden products excluded; search ignores case and trims spaces; type filters correct |
| Product options | Required options enforced (client and server); options must belong to the product |
| Cart | Add / update / delete with confirmation; totals correct; quantity ≤ 0 rejected |
| Checkout | Blank address, mismatched city/state, and re-checkout of an ordered cart all rejected |
| End-to-end order | Customer order → admin list + real-time admin notification → admin cancel → customer notification → order moves to "Previous" |
| Favorites | Toggle on/off, empty state |
| Profile | Email format, name, prefix and duplicate mobile validated |
| Change password | Rejects mismatch, wrong current, weak, or same-as-old passwords |
| Mobile layout | No horizontal overflow at 390 px |

---

## 5. Questions for the Product Owner

1. **Phone verification:** should signup require the `SIGNUP` OTP before the account becomes active?
2. **Password recovery:** confirm that "Forgot password" with the `PASSWORD_RESET` OTP is in scope.
3. **Orders:** should customers see order details and delivery status, and be able to cancel while the order is New?
4. **Payment and delivery:** is cash on delivery the only payment method? Should delivery fees be charged (they're currently always 0)?
5. **Email:** should email be optional for customers? Right now signup skips it but the profile demands it.
6. **Language:** should the customer app offer English? Today it's Arabic-only, but server messages arrive in English.

---

## 6. Test data created (to be removed)

| Record | ID | State |
|---|---|---|
| Customer | 4 — "QA Tester Karaz", mobile `0599999001`, email `qa.karaz.customer@example.com` | Active. This mobile number could belong to a real person: deactivate or delete the customer. |
| Order | 8 — store بيت الأناقة, 30 ILS | Cancelled by admin |
| Carts | 8 (checked out), 9 (emptied) | — |
| Notifications | 12 (admin, unread), 13 (customer) | — |

No other customer's data was changed.

---

## 7. Recommended next steps

1. Add OTP verification to signup, and add a forgot-password flow (EU-01, EU-06).
2. Fix price formatting on product cards and favorites (EU-03). This is quick and visible to customers.
3. Profile checkout performance and take notifications off the request path (EU-04).
4. Revoke sessions on password change and logout; move to HTTPS with HttpOnly cookies (EU-02, EU-05).
5. Make email optional in the profile, or collect it at signup (EU-07).
6. Add a quantity limit and map business errors to 4xx status codes (EU-08, EU-10).
7. Answer the PO questions in §5, then design order details and tracking (EU-09).
8. Run the "another customer's cart ID" test in dev with two QA accounts.

---

## Appendix — related files

| File | Content |
|---|---|
| `qa/features/karaz-enduser.md` | Screens, APIs, locators, business rules (for QA/automation) |
| `qa/bugs/2026-10-03-karaz-eu-*.md` | 10 bug reports |
| `qa/evidence/enduser/` | Screenshots, console log, bundle copy (internal only) |
| `qa/reports/karaz-qa-exploration-report-2026-09-23.*` | Admin panel report |
