# Karaz Admin Back-office — QA Exploration Report

| | |
|---|---|
| **Date** | 2026-09-23 |
| **System** | Karaz multi-store e-commerce — Admin panel |
| **Environment** | `http://169.58.165.26/KarazBackoffice` (API `/KarazApi/api`) |
| **Build** | UI footer "Admin Panel v2.0" (no build number exposed) |
| **Account** | `admin` (System Administrator) — the only role available |
| **Reference docs** | `KarazProject` folder: ER diagram docs (AR), constants spreadsheets, Oracle dump |
| **Method** | Manual exploratory testing with Playwright (Chromium, 1440×900), network and console inspection. No database access. |
| **Status** | 26 findings · 14 bug reports drafted (`qa/bugs/2026-09-23-karaz-*.md`) · none filed yet |

---

## 1. Summary

The admin panel covers the core catalogue setup (stores, products, store types, product categories/types, dynamic product fields) and order monitoring. The main flows work, and the server validates the most important fields. However:

- **Security:** the admin panel runs on **plain HTTP**, stores the access token where scripts can read it, and uses a weak default admin password. The login API reveals which usernames exist. The attachment download endpoint doesn't require login.
- **Financial reporting is wrong:** the dashboard shows revenue as **SAR**, but every order is in **ILS**, and nothing is converted. Products Overview shows **0 sales** for every product although orders exist.
- **Data quality isn't enforced on the server:** phone numbers accept any text, prices can be saved as 0, a double-click creates duplicate products, and a very large price returns a raw Oracle error to the user.
- **Misleading UI feedback:** a failed save shows a success message, Cancel keeps the unsaved value on screen, and every server error is shown as a generic "Request failed with status code 400".
- **Bilingual support is only on the surface:** the interface switches to Arabic/RTL, but data names don't follow the language.
- **Features in the spec that the admin UI doesn't have:** admin users, customers, subscriptions, delivery fees, store working hours, contact persons, and changing a store's status.

---

## 2. Scope and coverage

### Screens covered

| Area | Route | Coverage |
|---|---|---|
| Login | `/login` | Validation, invalid user, invalid password, success, sign-out, protected routes after logout |
| Dashboard | `/dashboard` | All widgets cross-checked against API data |
| Stores Management | `/stores` | List, search, stat-card filters, store details, inline editing, Add Store (validation, cascading dropdowns, create) |
| Add Store Products | `/stores/add-products` | Validation, category → type filtering, dynamic fields, price boundaries, double-submit, create |
| Product Tracking (orders) | `/stores/product-tracking` | List, status cards, category/store filters, order details |
| Products Overview | `/stores/products-overview` | Stats, filters, reset, show/hide toggle |
| Settings › Store Types | `/settings/store-types` | List, create, duplicate check, deactivate |
| Settings › Product Categories | `/settings/product-categories` | List, create (linked to a type), deactivate |
| Settings › Product Types | `/settings/product-types` | List, create, duplicate check, deactivate |
| Settings › Fields Management | `/settings/fields` | List, edit dialog (read-only), dropdown options, empty-submit validation |
| Global | — | Arabic/RTL toggle, notifications panel, unknown routes, token storage |

### Not tested (and why)

| Item | Reason |
|---|---|
| Creating/editing dynamic product fields | Fields must be attached to a live category, which would change the form real store owners use |
| Order status changes | All 7 existing orders are already Completed or Cancelled; orders can't be created from the admin panel |
| Account lockout after failed logins | Would lock the only admin account; no second account exists |
| Roles and permissions | Only one role exists, and there's no user-management screen |
| Whether the token stays valid after logout | Checking would mean capturing and replaying a live token, which I deliberately didn't do |
| Pagination | Every list is smaller than one page (stores 5/10, products 12/12, fields 5/6) |
| Database checks | No database access configured |
| Store-owner panel and customer app | Not in scope; no URLs provided |

---

## 3. Findings

Severity is judged by impact on users: **High** = a major function is wrong or there's a security exposure; **Medium** = broken, but there's a workaround or it affects a secondary path; **Low** = cosmetic or minor.
"Bug report" means a draft exists in `qa/bugs/`.

### 3.1 High

| ID | Finding | Layer | Bug report |
|---|---|---|---|
| F-01 | **Plain HTTP, and the token can be read by scripts.** No HTTPS, so the password and token travel in cleartext. The token is stored in cookie `karaz_access_token` (not HttpOnly, not Secure) and in localStorage `karaz-auth`. The `admin` account uses a weak default password. | Security | `karaz-http-token-storage` |
| F-02 | **Dashboard revenue is in the wrong currency.** Every order is in ILS. The dashboard adds the raw ILS amounts (389.97 = 30+30+30+99.99+199.98), doesn't convert them to the base currency (USD, rate 0.27), and labels the total "SAR". It also rounds 299.97 up to 300. | API + UI | `karaz-dashboard-revenue-currency` |

### 3.2 Medium

| ID | Finding | Layer | Bug report |
|---|---|---|---|
| F-03 | **Login reveals whether a username exists.** The screen message is generic, but the API error is keyed `details.UserName` for an unknown user and `details.Password` for a real user with a wrong password. | API / Security | `karaz-login-user-enumeration` |
| F-04 | **Every product image is broken.** The image link leaves out `/KarazApi`, so it returns 404. With the correct path it returns **500** "File not found on server.": the record exists but the file is missing, and a missing file should be a 404. | API + Environment | `karaz-attachment-images-broken` |
| F-05 | **Attachments can be downloaded without logging in.** Requests with no token reach the file lookup (500), while other endpoints return 401. The IDs are just base64 of 1, 2, 3… (`MjE` = 21), so anyone can go through all attachments, including user profile images. *(Inferred: no file could actually be downloaded because the files are missing.)* | Security | `karaz-attachment-unauthenticated` |
| F-06 | **Products Overview shows 0 sales and 0 revenue for every product.** Product 2 has 3 completed units (₪90) and product 3 has 3 (₪299.97). The dashboard's per-store figures are correct. | API | `karaz-product-sales-zero` |
| F-07 | **Cancel keeps the unsaved value.** On Store Details, clicking Cancel after editing a field leaves the typed value in the field and the page header, as if it had been saved. Nothing is sent to the server. | UI | `karaz-inline-edit-cancel-keeps-draft` |
| F-08 | **Data doesn't follow the chosen language.** The client sends `Accept-Language: AR`, but the API returns the same names either way. Store Types shows the Arabic name in English mode, while the Stores list shows the English one. Cities are Arabic only and states English only. Notifications are Arabic only. Forms save only one name, copied into both the AR and EN fields. | API + UI + Data | `karaz-localization-ignored` |
| F-09 | **Phone numbers aren't validated, on the client or the server.** Both accept `abc`, `1` and 20-digit numbers. The server saved `abc` with 200 OK. The country code defaults to **+972 (IL)**, even though Palestine (+970) is first in the configured order. Email *is* validated on the server. | UI + API | `karaz-store-phone-validation` |
| F-10 | **Products can be added under any category.** Add Product lists every category, not just the ones the store is set up to offer (Ardo Shoes offers only "حذاء سبور"). | UI / API | **Needs a PO decision.** Could be a spec gap. |
| F-17 | **Double-clicking "Add Product" creates two identical products.** The button isn't locked while saving and the server doesn't check for duplicates. Existing data already has 4 identical products in one store and 2 in another. | UI + API | `karaz-product-double-submit` |
| F-23 | **A failed save shows a success message.** When the server rejects an inline edit (400), the UI shows both "Request failed with status code 400" **and** "Store Name updated successfully!", and keeps the rejected value on screen. | UI | `karaz-inline-save-400-success` |
| F-25 | **Prices aren't validated on the server.** `0.001` passes the client and is **saved as 0**, creating a free product. `99999999999999` fails in the database, and the raw error `ORA-01438 … See the inner exception` is shown to the admin. | API | `karaz-product-price-validation` |

### 3.3 Low / Low-Medium

| ID | Finding | Layer | Bug report |
|---|---|---|---|
| F-11 | **Endless image-retry loop.** When an image is missing, the fallback loads from `via.placeholder.com`, which no longer works, and keeps retrying (~1.7 failed requests per second while the page is open). | UI | `karaz-placeholder-image-loop` |
| F-12 | **Sign-out doesn't contact the server.** The token is cleared in the browser but probably not revoked. *(Not tested.)* | Security | — |
| F-13 | **Internal codes aren't unique.** Product types 3 and 5 both use `PRODUCT_TYPE`; category 3 is `PRODUCT_CATEGORY`; one store type is `TEST`; type "Earring" shares `ACCESSORIES` with a category. New records now get codes built from the name, so this is old data. | Data | — |
| F-14 | **Store search is case-sensitive** and doesn't trim spaces ("Ardo" finds the store; "ardo" and " ardo " don't). Every search sends two requests (Take=10 and Take=5000). | API | — |
| F-15 | **Country and phone-code data is inconsistent.** Store 4's phone is saved under +972 although the store is in Palestine. Countries are listed alphabetically instead of by the configured order. "Occupied Territories" has no states. | Data / UI | — |
| F-16 | **Text fields have no length limit on screen** (600 characters accepted). The server caps store names at 200; other fields weren't checked. | UI | — |
| F-18 | **Cosmetic issues:** status shown as "active"/"none" in lowercase on details but "Active" in the list; heading typo "Field managements"; "categories.1 types"; store type "SuperMarker"; a cleared dropdown shows blank instead of its placeholder; the category picker ignores Escape; toasts stack up duplicates; two different date formats (`7/29/2026` vs `Jul 29, 2026`). | UI | — |
| F-19 | **Accessibility:** icon-only buttons have no labels, and dropdown items aren't marked as selectable options for screen readers. | UI | — |
| F-20 | **API responses have two different shapes.** Some endpoints return plain objects (`GetStoreProductConstants`, `GetStoreProducts`, `GetProductFields*`), others wrap them in `{status, message, data, error}`. | API | — |
| F-21 | **Order details are incomplete.** In `GetOrderById`, the order item's `statusName` is null, and the "Order Actions" section is empty. | API / UI | — |
| F-22 | **Cancel on Add Store throws away a filled form without asking.** | UI | — |
| F-24 | **Create/update store returns the entire store list** instead of just the store that changed. | API | — |
| F-26 | **Server error messages are hidden.** The API returns clear messages ("Store type name already exists", "Store name is required"…), but the UI always shows "Request failed with status code 400". One duplicate-type error also has an empty key (`details: {"": […]}`). | UI | `karaz-generic-400-toast` |

### 3.4 Observations (not defects)

- Unknown routes and `/stores/<id>` send you to the dashboard. There's no 404 page, and store details can't be bookmarked or linked to.
- Only orders 4–7 have notifications; orders 1–3 have none (possibly because they predate the notification feature).
- The "Total Revenue" currency on Products Overview comes from whichever product was added last: it changed from ILS to USD after one USD product was added.
- Some existing stores' products are priced in ILS while the store's currency is USD.
- Test data is messy: store 4's owner name is "Shoes", and store 1's address mixes Nablus and Tulkarm.

---

## 4. Verified working

| Rule | Evidence |
|---|---|
| Login: required-field errors, generic error message, redirect to the dashboard | Observed |
| Protected pages redirect to login after sign-out, including via the browser Back button | Observed |
| Add Store: required fields checked, spaces-only names rejected, email format checked | Observed |
| Country → state → city dropdowns reset the lower level when a higher level changes | Observed |
| Product types are filtered by the selected categories | Observed |
| Custom fields for a category appear on Add Product (Brand, Country of Origin, Size, Color); inactive fields are hidden | Observed |
| Server: store name required, spaces trimmed, 200-character max | API 400 responses |
| Server: email format checked | API 400 response |
| A script-injection attempt in a store name is shown as plain text and doesn't run | Observed |
| Duplicate store-type and product-type names rejected, regardless of upper/lower case | API 400 responses |
| Show/hide product and deactivate store type, category and product type all work | API 200 responses |
| An inactive store type no longer appears in Add Store | Observed |
| Order status cards and the category/store filters return the right orders | Observed + API |
| Arabic mode translates the interface, switches to RTL, and survives a reload | Observed |

---

## 5. Problems in the reference documents (`KarazProject` folder)

1. **Four constants spreadsheets contain the wrong table.** Days of week (ايام الاسبوع), payment frequency (تكرار دفع الاشتراك), payment methods (طرق الدفع) and contact types (انواع وسائل التواصل) all contain the **store statuses** table. Their real reference data is missing.
2. **Names don't match between the documents and the data:**
   - `IS_DEFUALT` is misspelled in the languages table.
   - The user-states table is `C_USER_STATUSES_TB` in the data but `C_USER_STATES_TB` in the ER document.
   - Attachment types point to tables `PRODUCTS_TB` and `USERS_TB`, which don't match `STORE_PRODUCTS_TB` / `S_USERS_TB`.
3. `ConstantsTables` and `ConstantsTables-1` are duplicates.
4. **The spec describes features with no admin screen:** admin users, customers, subscription plans and payments, delivery fees, store working days, contact persons, store status management, and password policy.

---

## 6. Open questions for the Product Owner

1. **Store categories (F-10):** should a product only be allowed in categories the store offers?
2. **Languages (F-08):** should every name have separate Arabic and English values, and should the API return the one matching the UI language?
3. **Reporting currency (F-02):** should dashboard and product revenue be shown in the base currency (USD, converted) or in each order's own currency?
4. **Order status names:** status 4 "New" appears as "Pending", 5 "Processing" as "In Progress", and 6 "Completed" as "Delivered" in some places. Which labels are correct?
5. **Missing admin screens:** is managing admin users, customers, subscriptions and delivery fees planned for this panel?

---

## 7. Test data created (to be removed)

All records are prefixed `QA-` and were created on 2026-09-23. The UI can't delete records, so these need removing through the database.

| Record | ID | Name | Left as |
|---|---|---|---|
| Store | 5 | QA-Karaz-Store-0923 | Active (the UI has no store-status control) |
| Product | 10 | QA-Product-A | Hidden |
| Product | 11 | QA-Price-0.001 (saved with price 0) | Hidden |
| Product | 13, 14 | QA-DoubleSubmit (duplicates) | Hidden |
| Store type | 7 | QA-StoreType-0923 | Inactive |
| Product type | 6 | QA-ProductType-0923 | Inactive |
| Product category | 4 | QA-Category-0923 (linked to product type 6) | Inactive |

No existing (non-QA) record was changed.

---

## 8. Recommended next steps

1. **Before anything else:** turn on HTTPS, move the token into an HttpOnly/Secure cookie, and change the `admin` password (F-01).
2. Fix the reporting figures (F-02, F-06): admins currently see wrong financial numbers.
3. Add server-side validation for phone and price, block double-submits, and stop returning raw database errors (F-09, F-17, F-25).
4. Fix the error handling in the UI's shared API layer (F-23, F-26, F-07). One change there fixes most of the misleading feedback.
5. Answer the open questions in §6, then write test cases in `qa/test-cases/karaz-backoffice.md`.
6. Provide a store-owner or customer account and a way to create orders, so order status changes, lockout and roles can be tested.

---

## Appendix — related files

| File | Content |
|---|---|
| `qa/features/karaz-backoffice.md` | Routes, APIs, locators, business rules (for QA/automation) |
| `qa/bugs/2026-09-23-karaz-*.md` | 14 bug reports, ready to file |
| `qa/evidence/karaz/` | Screenshots and API responses (not in git; contains store contact details, so internal use only) |
| `qa/runs/2026-09-23.jsonl` | Session execution log |
