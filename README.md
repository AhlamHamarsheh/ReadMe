# Karaz QA

Exploratory QA notes, reports and bug drafts for **Karaz**, a multi-store e-commerce platform
(admin back-office + customer portal).

| Folder | Contents |
|---|---|
| `qa/reports/` | Shareable reports (Markdown + Word): admin panel (2026-09-23), customer portal (2026-10-03) |
| `qa/features/` | Technical notes per portal: screens, APIs, locators, business rules, findings |
| `qa/bugs/` | Bug report drafts, one file per defect, not yet filed |
| `qa/runs/` | Session execution log (JSONL) |
| `tools/` | `gen_bugs.py` (JSON → bug drafts), `md2docx.js` (Markdown report → Word) |

## Regenerate a Word report

```bash
cd tools && npm install && cd ..
node tools/md2docx.js qa/reports/<report>.md qa/reports/<report>.docx
```

## Not in this repo
Screenshots, API responses and browser snapshots (`qa/evidence/`, `.playwright-mcp/`) are
excluded by `.gitignore`: they contain store contact details and customer data.
No credentials are stored anywhere in this repository.
