# Agent Guide

Use this file when assigning work to coding agents.

## Default Agent Workflow

1. Read the related issue, acceptance criteria, and `docs/agile/README.md`.
2. Inspect the existing code before proposing changes.
3. Keep the change scoped to the issue.
4. Run the smallest useful verification command.
5. Report changed files, verification result, and follow-up risks.

## Project Commands

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run sync:glossary:terms -- glnm
```

## Guardrails

- Do not run `npm.cmd run db:seed` unless the issue explicitly asks for a full reseed.
- Do not commit secrets or local database exports.
- Do not widen Angular budgets as a substitute for fixing oversized CSS unless the issue asks for that policy change.
- Preserve user work in dirty files; do not reset or revert unrelated changes.

## Good First Agent Tasks

- Convert a backlog item into a GitHub issue.
- Add acceptance criteria to an unclear issue.
- Fix a narrow UI regression with screenshot notes.
- Add or update docs after script behavior changes.
