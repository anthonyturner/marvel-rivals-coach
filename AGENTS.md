# Agent Guide

Use this file when assigning work to coding agents.

## Default Agent Workflow

Use [.github/agents/pm-agent.md](.github/agents/pm-agent.md) as the default product-manager agent for this repository.

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

## Useful Skills

- Use the SOLID audit skill when reviewing a module for maintainability and design issues without changing behavior.
- Use the SOLID refactor skill when making a focused refactor toward cleaner, more extensible design.
- These skills are available automatically when the task matches their descriptions, so prefer them when the request fits their scope.

## Automation Workflow

- A starter workflow is available at [.github/workflows/issue-automation.yml](.github/workflows/issue-automation.yml) for creating a GitHub issue and optionally a branch from a prompt.
- A second workflow at [.github/workflows/create-issue-branch.yml](.github/workflows/create-issue-branch.yml) can create a branch from an issue number or a title-derived slug.
- A third workflow at [.github/workflows/create-pr-from-branch.yml](.github/workflows/create-pr-from-branch.yml) can open a draft PR from an existing branch.
- A fourth workflow at [.github/workflows/mark-pr-ready-for-review.yml](.github/workflows/mark-pr-ready-for-review.yml) can promote that draft PR to ready-for-review when you are satisfied with it.
- Use the PM agent for drafting and refinement, and the workflow for repository automation.
