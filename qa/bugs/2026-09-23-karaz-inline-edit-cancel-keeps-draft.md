---
title: "[FE][Karaz][Admin][Store Details] - Inline edit Cancel keeps the unsaved value displayed as if saved"
team: FE
severity: Medium
classification: UI/UX
project_text: KARAZ
flow: Stores
scenario: "F-07 from Karaz admin exploration 2026-09-23"
summary: "Inline edit Cancel keeps the unsaved value displayed as if saved"
workaround: None known.
---

# Inline edit Cancel keeps the unsaved value displayed as if saved

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | Medium |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | 2026-09-23 |
| **KB ref** | `F-07` in `../features/karaz-backoffice.md` |

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
| Reproducible | 2/2 |

## Summary

On Store Details, pressing **Cancel** (✕) after editing a field closes the editor but still shows the typed value, both in the field and in the page header. No request is sent, so the server keeps the old value. The admin believes a change was made when it wasn't, or sees a blank store name.

## Steps to reproduce

1. On `/stores`, open the row action for store 4 (read-only check, nothing saved).
2. Click the pencil next to Store Name.
3. Type `QA-typed-not-saved`, or clear the field.
4. Click ✕ (Cancel).

## Expected

The field and the header go back to the saved value (`Ardo Shoes`).

## Actual

The field and header show `QA-typed-not-saved` (or blank). No `UpdateStore` request is sent, and *Back to Stores* shows the original name in the list.

## Layer

| Layer | Finding |
|---|---|
| UI | Draft value not reset on cancel; the header is bound to the draft |
| Network | No request (correct) |

**Classification:** Defect

## Impact

All inline-editable fields on Store Details (they share one component). **Medium**: the screen is misleading and can lead to wrong decisions, but no data is corrupted.

## Evidence

`qa/evidence/karaz/inline-edit-cancel-keeps-draft.png`.

## Notes for the developer

Related: bug `karaz-inline-save-400-success`. The same component shows success when a save fails.

## Follow-up

- [ ] Filed to ClickUp — ID: `______` (ClickUp not configured for Karaz — file manually)
- [ ] Added to `../knowledge-base/known-issues.md`
- [ ] Regression test case added to `../test-cases/karaz-backoffice.md`
- [ ] Verified fixed on build `______`
