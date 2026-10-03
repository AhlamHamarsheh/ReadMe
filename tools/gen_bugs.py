"""Generate bug-report drafts from a JSON list.

Usage (from the Karaz-QA root):
  python3 tools/gen_bugs.py <bugs.json> <date> <portal> <account> <kb-file> <portal-short>
"""
import json
import pathlib
import sys

src, date, portal, account, kb, portal_short = sys.argv[1:7]

ENV = f"""| | |
|---|---|
| Project | Karaz (multi-store e-commerce) |
| Environment | dev/test · `http://169.58.165.26` |
| Build | No build id exposed |
| Portal | {portal} |
| Role / account | {account} |
| Browser | Chromium (Playwright MCP) · 1440×900 |
| First seen | {date} |
| Reproducible | REP |"""

FOOT = """
## Follow-up

- [ ] Filed to ClickUp — ID: `______`
- [ ] Added to known issues
- [ ] Regression test case added
- [ ] Verified fixed on build `______`
"""

TEMPLATE = """---
title: "{title}"
team: {team}
severity: {sev}
classification: {cls}
project_text: KARAZ
flow: {flow}
scenario: "{fid} from Karaz {portal_short} exploration {date}"
summary: "{short}"
workaround: {workaround}
---

# {short}

| | |
|---|---|
| **Status** | Draft — not yet filed |
| **ClickUp** | — |
| **Severity** | {sev} |
| **Reported by** | QA (Claude-assisted exploration) |
| **Date** | {date} |
| **KB ref** | `{fid}` in `../features/{kb}` |

## Environment

{env}

## Summary

{summary}

## Steps to reproduce

{steps}

## Expected

{expected}

## Actual

{actual}

## Layer

| Layer | Finding |
|---|---|
{layer}

**Classification:** {klass}

## Impact

{impact}

## Evidence

{evid}
{notes_block}{foot}"""

for b in json.load(open(src, encoding="utf-8")):
    short = b["title"].split(" - ", 1)[1]
    notes_block = ("\n## Notes for the developer\n\n" + b["notes"] + "\n") if b.get("notes") else ""
    body = TEMPLATE.format(
        short=short, env=ENV.replace("REP", b["rep"]), notes_block=notes_block, foot=FOOT,
        klass=b.get("klass", "Defect"), workaround=b.get("workaround", "None known."),
        date=date, kb=kb, portal_short=portal_short,
        **{k: v for k, v in b.items() if k not in ("notes", "klass", "workaround")},
    )
    out = pathlib.Path("qa/bugs") / f"{date}-{b['slug']}.md"
    out.write_text(body, encoding="utf-8")
    print(out)
