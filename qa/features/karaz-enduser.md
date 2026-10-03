# Feature: Karaz Customer Portal (End User)

| | |
|---|---|
| **Slug** | `karaz-enduser` |
| **Portal** | `http://169.58.165.26/KarazEndUser/` — API `/KarazCustomersApi/api` |
| **Bundle** | `assets/index-DIQJPpoa.js` (Vite, production, `VITE_ENABLE_MOCK_AUTH=false`) |
| **Last verified** | 2026-10-03 · source: observed via Playwright MCP + API responses + bundle review |
| **Test account** | QA customer #4 `QA Tester Karaz` · mobile `0599999001` (password in your secrets store only) |
| **Overall confidence** | High for signup/login/catalogue/cart/checkout/profile; order tracking and payment don't exist in the product |

---

## 1. Screens and routes

The SPA has **no routes**: the URL stays `/KarazEndUser/` on every screen, so product, cart and order pages can't be deep-linked or shared. **Confirmed**

| Screen (sidebar) | Purpose | API |
|---|---|---|
| Login | Mobile + password, Remember me | `POST /Customers/Login` |
| Signup (إنشاء حساب) | Name, mobile, password ×2, country/state/city, address | `POST /Customers/Subscribe`, `GET /Lookups/GetCountries|GetStates|GetCities` |
| المنتجات (Products) | Grouped by product type, type filter chips, search | `GET /Products/GetProducts?search=&productTypeId=&Skip&Take=12` |
| Product details | Name, store, price, description, dynamic fields, qty, add to cart | `GET /Products/GetProductDetails` |
| سلتي (Cart) | Lines, +/−, delete (confirm), delivery address, summary, checkout | `GET /Carts/GetCart`, `POST /Carts/AddToCart|UpdateCartItemQuantity|RemoveFromCart`, `POST /Orders/Checkout` |
| طلباتي (Orders) | Tabs الحالية (status 4, 5) / السابقة (6, 7) | `GET /Orders/GetOrders?statusIds=` |
| المفضلة (Favorites) | List, toggle | `GET /FavoriteProducts/GetFavoriteProducts`, `POST /FavoriteProducts/ToggleFavorite` |
| الملف الشخصي (Profile) | View/edit profile, change password | `GET /Customers/GetProfile`, `POST /Customers/UpdateProfile` (multipart), `POST /Customers/ChangePassword` |
| الإعدادات (Settings) | **Opens the same Profile page**, no settings of its own | — |
| Bell | Notifications (SignalR `/hubs/notifications`) | `GET /Notifications/GetNotifications|GetUnreadCount`, `POST MarkAsRead|MarkAllAsRead|RegisterFirebaseToken` |
| Avatar menu (header) | Profile, **Logout** (only place it exists) | none — logout is client-only |

### Locators (for automation)
- Login: `getByRole('textbox',{name:'رقم الجوال'})`, `getByRole('textbox',{name:'كلمة المرور'})`, `getByRole('button',{name:'تسجيل الدخول'})`.
- Signup: `#fullName #cellular #password #confirmPassword #fullAddress`; dropdowns are buttons with text `اختر الدولة` / `اختر المحافظة` / `اختر المدينة`.
- Profile name input has **no `type` attribute**, so use `input:not([type])`. Email `input[type=email]`, mobile `#cellular`.
- Cart: `button:has(svg.lucide-plus|lucide-minus|lucide-trash2)`; delete dialog button `حذف`; checkout `إتمام الطلب` → dialog `تأكيد الطلب`.
- Header avatar: `header` button containing `svg.lucide-user` (the sidebar Profile link uses the same icon).

## 2. Business rules

| ID | Rule | Status | Source |
|---|---|---|---|
| BR-EU-01 | Customer password: ≥8 chars, upper, lower, number, complexity, enforced by the server on signup and change | Confirmed | API 400 messages + `C_PASSWORD_POLICIES_TB` |
| BR-EU-02 | Full name letters only (spaces allowed, digits/hyphen rejected) | Confirmed | API |
| BR-EU-03 | Mobile must start with a valid prefix for the chosen country; leading 0 stripped (`0599999001` → `599999001`, username `970599999001`) | Confirmed | API |
| BR-EU-04 | Mobile unique across customers, **regardless of country code** | Confirmed | API |
| BR-EU-05 | Signup verifies the mobile by OTP (`SIGNUP`) | **Not implemented** (EU-01) | spec |
| BR-EU-06 | Hidden/inactive products never appear and can't be added to the cart | Confirmed | UI + API (`Product is not available`) |
| BR-EU-07 | Required option fields must be chosen before add-to-cart; options must belong to the product | Confirmed (client + server) | API |
| BR-EU-08 | Quantity > 0 | Confirmed; **no upper bound** (EU-08) | API |
| BR-EU-09 | Checkout needs a non-blank address and a consistent country/state/city; a cart can be checked out only once | Confirmed (server) | API |
| BR-EU-10 | New order → status 4 (New); admin notified in real time; admin cancel → customer notified, order moves to السابقة | Confirmed end-to-end (order #8) | observed |
| BR-EU-11 | Delivery fee | Always 0 (no delivery-fee config). **Assumed** to be unconfigured | API |
| BR-EU-12 | Payment method | None in checkout (cash on delivery assumed) | bundle |

## 3. Findings (2026-10-03)

| ID | Finding | Layer | Sev | Bug draft |
|---|---|---|---|---|
| EU-01 | Signup creates an active account with **no OTP / phone verification**; anyone can register any number | API | High | `2026-10-03-karaz-eu-signup-no-otp` |
| EU-02 | Plain HTTP; token in a script-readable cookie `karaz_customer_access_token` (not HttpOnly or Secure) + localStorage `karaz-customer-auth` | Security | High | see admin `karaz-http-token-storage` |
| EU-03 | Product cards and favorites **round prices** (99.99 → `100 ILS`) | UI | Medium | `…-karaz-eu-price-rounded` |
| EU-04 | `Orders/Checkout` took **13.7 s** | API | Medium | `…-karaz-eu-checkout-slow` |
| EU-05 | Token still valid after password change; logout client-only | Security | Medium | `…-karaz-eu-session-not-revoked` |
| EU-06 | **No forgot-password** flow at all | Feature | Medium | `…-karaz-eu-no-password-recovery` |
| EU-07 | Profile requires email to save anything; signup never collects email | UI | Medium | `…-karaz-eu-profile-requires-email` |
| EU-08 | No max quantity (100,000 accepted → 3,000,000 ILS line) | API | Medium | `…-karaz-eu-cart-no-max-quantity` |
| EU-09 | Orders can't be opened: no details, tracking or customer cancel | Feature | Medium | `…-karaz-eu-no-order-details` |
| EU-10 | Business errors returned as **500** (cart not found, duplicate mobile, wrong current password) | API | Low | `…-karaz-eu-500-for-business-errors` |
| EU-11 | Cart badge 0 after login until the cart is opened (GetCart is called before login → 401 and never refetched) | UI | Low | `…-karaz-eu-cart-badge-stale-after-login` |
| EU-12 | Mixed languages: English server messages in the Arabic UI ("Invalid username or password", "Full name must contain letters only", "Email format is invalid", "New password must be different…"); field names `Brand`, `Color` in English | UI/API | Low | — |
| EU-13 | Only the first server error is shown: on signup, password-policy errors are hidden behind the name error; login with letters in the mobile says "رقم الجوال مطلوب" (mobile required); errors from earlier attempts stay on screen | UI | Low | — |
| EU-14 | Required dropdown field `Color` has **no options** for product 2 and is silently skipped (config inconsistency) | Data | Low | — |
| EU-15 | Checkout confirmation shows only the amount (no address, items or store). A blank address still opens the confirm dialog (the server rejects it) | UI | Low | — |
| EU-16 | Search placeholder fixed to "ابحث عن أحذية..." (search shoes) whatever type is selected | UI | Low | — |
| EU-17 | "الإعدادات" (Settings) duplicates Profile; no language or notification preferences; no language switch anywhere | UI | Low | — |
| EU-18 | No routes or deep links; `<html lang="en">` with no `dir` on an Arabic UI; two nested `<main>` landmarks | UI / a11y | Low | — |
| EU-19 | Mixed numerals: dates in Arabic-Indic digits (٣/١٠/٢٠٢٦), prices in Latin digits; no thousands separators (`3000030.00 ILS`) | UI | Low | — |
| EU-20 | Mock-auth code and a demo-credentials panel are shipped in the production bundle (disabled by flag) | Build | Low | — |
| EU-21 | Mobile uniqueness ignores the country code (+970 vs +972 with the same local digits collide) | API | Low | — |
| EU-22 | The customer gets **no notification when an order is placed** (only on cancellation) | API | Low | — |
| EU-23 | Product images broken (same root cause as admin F-04); the fallback is an external Unsplash URL | API | Medium (shared) | admin `karaz-attachment-images-broken` |
| EU-24 | Empty cart has no "start shopping" button; on mobile the nav is hidden behind the sidebar toggle | UI | Low | — |
| EU-25 | Spec features absent: payment method, order-confirmation OTP (`ORDER_CONFIRM`), delivery fees, delivery tracking | Spec gap | — | ask PO |

### Admin-side findings discovered via this flow
- **Order Actions now confirmed** (they couldn't be tested before because every order was terminal): a New order offers **Out for delivery** and **Cancel order**. Cancel → `POST /KarazApi/api/Orders/UpdateOrderStatus {orderId, statusId:7}` with a confirm dialog. **Confirmed**
- Cancel dialog buttons read "**Cancel** / Confirm / Close"; here "Cancel" means "keep the order". Confusing wording. Low.

## 4. Verified working
- Login: empty-field validation; server-side prefix check; generic error for unknown numbers.
- Signup: server-enforced password policy, letters-only name, duplicate-mobile rejection (with and without the leading 0).
- Catalogue: hidden products excluded; search is case-insensitive and trimmed; type filters; product details with dynamic fields (text values, checkbox options).
- Cart: add, +/− (minus disabled at 1), delete with confirmation, totals; server checks required options, foreign options, quantity ≤ 0, and hidden/missing products.
- Checkout end-to-end: order #8 created → visible in admin as New → admin notified in real time → admin cancel → customer notified → order moves to السابقة.
- Favorites toggle on/off, with a helpful empty state.
- Profile: server checks email format, letters-only name, prefix, duplicate mobile.
- Change password: rejects mismatch, wrong current, weak new, or same-as-old.
- Mobile 390 px: no horizontal overflow.

## 5. Not tested
- Username enumeration on login, account lockout: would need failed attempts on a real customer's account.
- Checkout using another customer's `cartId` (possible IDOR): if vulnerable it would create a real order on their account. **Recommend a dev test with two QA accounts.**
- "Out for delivery" and later delivery states (to avoid moving a real store's order through delivery).
- Firebase push notifications (`RegisterFirebaseToken`), notification mark-as-read.
- Pagination (catalogue is 8 products, page size 12).

## 6. QA data created (2026-10-03)
| Entity | Id | State |
|---|---|---|
| Customer | 4 · `QA Tester Karaz` · `0599999001` · email `qa.karaz.customer@example.com` | Active. **Note:** `0599999001` may be a real person's number; delete or deactivate this customer |
| Order | 8 (store بيت الأناقة, 30 ILS) | **Cancelled** by admin |
| Carts | 8 (checked out), 9 (emptied) | — |
| Notifications | 12 (admin, "New order #8", unread), 13 (customer, "Order #8 cancelled") | — |
| Favorites | none (toggled on and off) | — |
