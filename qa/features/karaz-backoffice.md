# Feature: Karaz Admin Back-office (full exploration)

| | |
|---|---|
| **Slug** | `karaz-backoffice` |
| **Portal** | Admin (`/KarazBackoffice`) — API at `/KarazApi/api` |
| **Spec** | `~/Downloads/KarazProject` — ER docs (AR), constants xlsx, Oracle dump |
| **Last verified** | UI "Admin Panel v2.0" (no build id exposed) · `http://169.58.165.26` · 2026-09-23 |
| **Overall confidence** | Medium-High — every screen walked; write paths tested on QA-owned records (store, product, taxonomy); dynamic-field writes, order transitions, lockout and RBAC still untested |

_Stamp for everything below unless stated: v2.0 · 169.58.165.26 · 2026-09-23 · source: observed via Playwright MCP + API responses_

---

## 1. Purpose

Central admin panel of a multi-store e-commerce platform (Palestine market). Admin creates and
configures stores, their product catalogue, taxonomy (store types, categories, types) and the
dynamic product fields store owners fill in; monitors customer orders and revenue.

## 2. Access

| Role | Account | Notes |
|---|---|---|
| System admin | `admin` ("System Administrator") | Only role explored. Password in env/secrets only. |

No role/permission UI exists — cannot test RBAC from this panel.

## 3. Routes & screens

| Menu | Route | Main API |
|---|---|---|
| Login | `/login` | `POST /Users/Login` |
| Dashboard | `/dashboard` | `GET /Dashboard/GetOverview` |
| Stores › Stores Management | `/stores` (details view has **no own route**) | `GET /Stores/GetStores`, `GetStoreById?id=`, `GetStoreConstants` |
| Stores › Add Store Products | `/stores/add-products` | `GET /StoreProducts/GetStoreProductConstants` |
| Stores › Product Tracking (= orders) | `/stores/product-tracking` | `GET /Orders/GetOrders`, `GetOrderStatusCounts`, `GetOrderById?id=` |
| Stores › Products Overview | `/stores/products-overview` | `GET /StoreProducts/GetStoreProducts` |
| Settings › Store Types | `/settings/store-types` | `GET /StoreTypes/GetStoreTypes` |
| Settings › Product Categories | `/settings/product-categories` | `GET /ProductCategories/GetProductCategories` |
| Settings › Product Types | `/settings/product-types` | `GET /ProductTypes/GetProductTypes` |
| Settings › Fields Management | `/settings/fields` | `GET /ProductFields/GetProductFields`, `GetProductFieldDetails?fieldId=`, `GetProductFieldConstants` |
| Notifications (bell) | header | SignalR `/hubs/notifications`, `GET /Notifications/GetNotifications?take=30`, `GetUnreadCount` |

Unknown routes and `/stores/<id>` redirect to `/dashboard` (no 404 page). **Confirmed**

**Not present in UI but in spec:** admin users (S_USERS_TB), customers, subscriptions/plans/payments,
delivery fees, store working days, contact persons, store status change, password policy. **Confirmed** (absent)

## 4. UI notes for automation

- Dropdowns are custom popovers: `getByRole('combobox')` works for triggers, but items are **not** `role=option` — click by text.
- Row actions, inline-edit pencil/save/cancel, and card toggles are icon-only buttons with **no accessible name**; locate via `button:has(svg.lucide-pencil|lucide-save|lucide-x|lucide-toggle-right)`.
- Store form ids: `#name #ownerName #email #phone #description #address`. Product form: `#product-name`, price `input[type=number]` (min 0, step 0.01), `input[type=file][accept=image/*][multiple]`.
- Add Store validates inline (all errors at once); Add Product / Add Field validate via **toast, one field at a time** (order: name → store → …).

## 5. Business rules

| ID | Rule | Status | Source |
|---|---|---|---|
| BR-KZ-01 | Login shows generic "Invalid username or password" | Confirmed | observed |
| BR-KZ-02 | Account locks after N failed logins (`FAILED_ATTEMPTS`, `LOCK_EXPIRES_ON`) | Assumed — **not tested** (would lock `admin`) | ER doc §7 |
| BR-KZ-03 | Password policy: min 8, upper+lower+number, 3 rules | Assumed — no UI to change password | constants xlsx |
| BR-KZ-04 | Store requires name, owner, type, email, phone, country, address, ≥1 category | Confirmed (client); category error never shown | observed |
| BR-KZ-05 | Country → State → City cascade; child resets on parent change | Confirmed | observed |
| BR-KZ-06 | Product types offered = those linked to selected categories | Confirmed | observed |
| BR-KZ-07 | Store only sells products in its own categories (STORE_PRODUCT_CATEGORIES_TB) | Assumed — **UI does not enforce** (see F-10) | ER doc §11 |
| BR-KZ-08 | Active dynamic fields linked to a category render on Add Product; inactive hidden | Confirmed (موضة → Brand, Country of Origin, Size, Color; `test` hidden) | observed |
| BR-KZ-09 | Base currency USD; others via RATE_TO_BASE | Confirmed in constants; **not applied** in reports (F-02) | constants + API |
| BR-KZ-10 | Order states New(4)/Processing(5)/Completed(6)/Cancelled(7); delivery states 8–11 separate | Confirmed ids; UI relabels 4="Pending", 5="In Progress", 6="Delivered"/"Completed" | API |
| BR-KZ-11 | Codes (store type / category / product type) are unique | Assumed — data violates it (F-13) | inferred |
| BR-KZ-12 | Names are bilingual (`_NA` / `_FO`) and follow UI language | Assumed from spec — **not implemented** (F-08) | ER doc |

## 6. Findings (2026-09-23) — none filed yet

Layer: UI / API / Data / Security. Severity per root CLAUDE.md §4.

| # | Finding | Layer | Class | Sev | Evidence |
|---|---|---|---|---|---|
| F-01 | Plain HTTP; access token in non-HttpOnly, non-Secure cookie `karaz_access_token` + localStorage `karaz-auth` | Security/Env | Defect | High | cookie flags observed |
| F-02 | Dashboard labels revenue **SAR**; orders are **ILS**; values summed raw, no conversion to base USD (389.97 = ILS sum) | API+UI | Defect | High | GetOverview vs GetOrders |
| F-03 | Login API leaks which field was wrong (`details.UserName` for unknown user vs `details.Password` for real user) → username enumeration | API | Defect | Medium | 400 bodies |
| F-04 | Product images broken: API emits `http://…/api/attachment/download/<b64 id>` (missing `/KarazApi`) → 404; correct path → **500** "File not found on server." (should be 404; file missing on disk) | API+Env | Defect | Medium | console + fetch |
| F-05 | Attachment download reachable **without auth**, ids are base64 of sequential ints (`MjE`=21) | Security | Defect (inferred from 500 vs 401) | Medium | fetch w/o bearer |
| F-06 | Products Overview: `salesCount`/`revenue` = 0 for all products, though product 2 has 3 completed units (₪90) and product 3 has 3 (₪299.97) | API | Defect | Medium | GetStoreProducts |
| F-07 | Inline edit **Cancel** keeps the unsaved draft displayed (name + page header) as if saved; reproduced 2/2; no request sent, server unchanged | UI | Defect | Medium | `inline-edit-cancel-keeps-draft.png` |
| F-08 | Server ignores `Accept-Language: AR` — data names stay FO/EN; many records have NA=FO or only one language; cities Arabic-only, states English-only; notifications Arabic-only in EN | API+Data | Defect/Spec gap | Medium | headers + payloads |
| F-09 | Phone has no format validation — client **and server** (UpdateStore saved `abc`) (accepts `abc`, `1`, 20 digits, `+970…` with code already chosen); default code **+972 (IL)** though Palestine sortOrder=1 | UI | Defect | Medium | observed |
| F-10 | Add Product lists **all** categories regardless of store's configured categories (Ardo Shoes offers only حذاء سبور) | UI/API | Defect or spec gap → ask PO | Medium | observed |
| F-11 | Missing-image fallback uses `via.placeholder.com` (dead) in an endless onerror loop (~1.7 req/s while page open) | UI | Defect | Low-Med | console count 54→71/10s |
| F-12 | Logout is client-only — no API call, token not revoked server-side (revocation untested) | Security | Assumed | Low-Med | network |
| F-13 | Non-unique/placeholder codes: types 3 & 5 = `PRODUCT_TYPE`, category 3 = `PRODUCT_CATEGORY`, store type 2 = `TEST`; type `ACCESSORIES` = category code | Data | Test-data / missing uniqueness | Low | API |
| F-14 | Store search is **case-sensitive** and untrimmed ("Ardo" ✓, "ardo"/" ardo " ✗); every search fires 2 calls (Take=10 & Take=5000) | API | Defect | Low | request log |
| F-15 | Store phone shown `+972` for a Palestine store (phoneCountryId=2 "Occupied Territories"); Countries list sorted alpha not SORT_ORDER; "Occupied Territories" has 0 states | Data/UI | Spec gap | Low | API |
| F-16 | No max-length on any text field (600 chars accepted client-side). Server caps store name at 200 (Confirmed); other fields unverified | UI | Defect (UX) | Low | observed |
| F-17 | Duplicate products: double-click Add Product creates 2 (reproduced); explains 4× "حذاء رسمي" / 2× "Earrings" | UI+API | Defect | Medium | test products #13, #14 |
| F-18 | Cosmetic: status "active"/"none" lowercase on details vs "Active" in list; "Field managements"; "categories.1 types"; typo store type "SuperMarker"; cleared dropdown shows blank not placeholder; category picker ignores Escape; duplicate stacked toasts; date formats differ (notifications `7/29/2026` vs `Jul 29, 2026`); dashboard rounds 299.97 → 300 | UI | Defect | Low | observed |
| F-19 | Accessibility: icon-only buttons unlabeled; list items lack `role=option` | UI | Defect | Low | a11y tree |
| F-20 | API envelope inconsistent: `GetStoreProductConstants`, `GetStoreProducts`, `GetProductFields*` return bare objects, others `{status,message,data,error}` | API | Defect | Low | responses |
| F-21 | Order item `statusName` null in `GetOrderById`; "Order Actions" section renders empty | API/UI | Defect | Low | GetOrderById?id=7 |
| F-22 | Cancel on Add Store discards a filled form without confirmation | UI | UX | Low | observed |
| F-23 | Inline edit: when `UpdateStore` returns **400**, UI shows raw "Request failed with status code 400" **and** "Store Name updated successfully!", and keeps the rejected value displayed (blank header). 3/3 rejected cases | UI | Defect | Medium | `inline-save-400…`, request log |
| F-24 | `AddStore` / `UpdateStore` respond with the **entire store list** instead of the affected store | API | Defect (perf/contract) | Low | responses |
| F-25 | Price `0.001` saved as 0 (free product); oversized price returns raw `ORA-01438` to UI | API | Defect | Medium | test products #11 / failed insert |
| F-26 | All server 400 messages replaced by generic "Request failed with status code 400" toast (store types, product types, store edit) | UI | Defect | Low | responses |

### Write-path results (test-owned store #5 "QA-Karaz-Store-0923", created 2026-09-23)
- `POST /Stores/AddStore` → 200. Payload sends only `storeNameNa`/`ownerNameNa` (no `_Fo`). `productTypeIds: []` accepted → product types optional. **Confirmed**
- `POST /Stores/UpdateStore` (full object, not a patch) server rules: name required, whitespace-only rejected, **max 200 chars** (`"Store name maximum length is 200 characters"`). **Confirmed**
- Name `<img src=x onerror=alert(1)>` stored and rendered as inert text — no script execution. **Confirmed**
- Store #5 left with its original name. It still exists (no delete in UI) — clean up via DB/dev.
- Session 2 (user approved writes on QA-labelled records):
  - Phone: `UpdateStore` accepts `abc` and `1` → **200, saved** — no server phone rule (F-09 now BE+FE). Email: server rejects `not-an-email` (400 "Invalid email address"). **Confirmed**
  - `CreateStoreProduct` (multipart: StoreId, ProductNameNa, ProductCategoryId, ProductTypeId, Price, CurrencyId, Description, IsActive) → 200. Form fully resets after success. **Confirmed**
  - Price: client blocks 0 / −5; `0.001` accepted, **stored as 0** (F-25); `99999999999999` → 400 with raw `ORA-01438` shown in toast (F-25). **Confirmed**
  - Double-click Add Product → **2 products** (#13, #14) — F-17 promoted to Confirmed. **Confirmed**
  - Visibility: `POST /StoreProducts/ActivateStoreProduct {id}` / `DeactivateStoreProduct {id}` work; no confirmation. **Confirmed**
  - Products Overview `overview.currencyCode` flipped ILS → USD after the first USD product → header currency comes from an arbitrary product (feeds F-02). **Confirmed**
  - Taxonomy: `CreateStoreType` / `CreateProductType` / `CreateProductCategory` (multipart, Na = Fo = typed name, Code = UPPER_SNAKE of name). Duplicate names rejected case-insensitively (400). Deactivate endpoints work, no confirmation; inactive store type disappears from Add Store. **Confirmed**
  - Every 400 surfaces as generic "Request failed with status code 400" (F-26). **Confirmed**
- Not attempted (would touch real config): creating/editing dynamic fields (must attach to a live category), deactivating a type in use by real stores, order status changes (no non-terminal orders).

### QA test data to clean up (all created 2026-09-23)
| Entity | Id | Name | State left |
|---|---|---|---|
| Store | 5 | QA-Karaz-Store-0923 | Active (no status control in UI) |
| Products | 10, 11, 13, 14 | QA-Product-A, QA-Price-0.001 (price 0), QA-DoubleSubmit ×2 | Hidden |
| Store type | 7 | QA-StoreType-0923 | Inactive |
| Product type | 6 | QA-ProductType-0923 | Inactive |
| Product category | 4 | QA-Category-0923 (→ type 6) | Inactive |

### Spec-document issues (KarazProject folder)
- 4 constants files contain the **Store Statuses** table instead of their own data: ايام الاسبوع (days), تكرار دفع الاشتراك (payment frequency), طرق الدفع (payment methods), انواع وسائل التواصل (contact types). Real reference data for those is missing. **Confirmed**
- `IS_DEFUALT` misspelled column (C_LANGUAGES_TB); user-states file is `C_USER_STATUSES_TB` vs doc `C_USER_STATES_TB`; attachment types reference `PRODUCTS_TB`/`USERS_TB` which don't match `STORE_PRODUCTS_TB`/`S_USERS_TB`. **Confirmed**
- `ConstantsTables` and `ConstantsTables-1` are duplicates.

## 7. Not covered / blocked

- Any create/update/delete (store, product, taxonomy, fields, visibility toggle, order status) — shared env, no approval for writes → server-side validation, max-lengths, price rules, duplicate checks **unverified**.
- Order status transitions — all 7 orders are terminal (Completed/Cancelled).
- Pagination — datasets smaller than page size (stores 4/10, products 8/12, fields 5/6).
- Lockout (BR-KZ-02), token revocation after logout, other roles, DB checks (no DB access configured).
- Store-owner panel and customer app — not in scope/URL not provided.

## 8. History

- 2026-09-23 — first exploration, cold start (no prior KB). All screens mapped; 22 findings, 0 filed.
- 2026-09-23 — write-path session on test-owned store #5: server validation confirmed; F-23, F-24 added. Bug drafts in `qa/bugs/2026-09-23-karaz-*.md`.
- 2026-09-23 — session 2 (writes approved): phone/price/double-submit/visibility/taxonomy covered; F-25, F-26 added; F-17 confirmed; 14 bug drafts total.
