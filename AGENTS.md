# Agent Guide

Use this file when assigning work to coding agents.

## Default Agent Workflow

Use [.github/agents/pm-agent.md](.github/agents/pm-agent.md) as the default product-manager agent for this repository.

Use [.github/agents/developer-agent.md](.github/agents/developer-agent.md) when you want implementation work to begin for an approved issue.

### Agent handoff
- Use the PM agent for issue drafting, refinement, acceptance criteria, and clarifying questions.
- Use the developer agent only after the issue is reviewed and you explicitly want implementation to begin.
- Do not let the developer agent start work just because an issue exists.

### Handoff prompt template
When you want the developer agent to begin implementation, use a prompt like:

> Implement issue #<issue-number>. Read the issue, create or use an implementation branch, implement the change, run relevant verification, and open a draft PR for my review.

If the user says “finish the implementation,” treat it as a handoff request to review the current branch, commit the changes, push the branch, and open a draft PR to master.

### PM prompt template
When a client request arrives, use a prompt like:

> Turn this client request into a small, testable GitHub issue for this repository. Use the repository's issue template and backlog style. Include title, summary, acceptance criteria, affected area, and any open questions. Do not propose implementation steps.

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

- The main workflow at [.github/workflows/issue-automation.yml](.github/workflows/issue-automation.yml) can create a GitHub issue and optionally a branch from a prompt.
- If you are acting as a client, paste a plain request such as “I want to improve the UI on the heroes screen” into the workflow’s request prompt field and the workflow will auto-fill the issue title, summary, user story, and acceptance criteria.
- A second workflow at [.github/workflows/create-issue-branch.yml](.github/workflows/create-issue-branch.yml) can create a branch from an issue number or a title-derived slug.
- A third workflow at [.github/workflows/create-pr-from-branch.yml](.github/workflows/create-pr-from-branch.yml) can open a draft PR from an existing branch.
- A fourth workflow at [.github/workflows/mark-pr-ready-for-review.yml](.github/workflows/mark-pr-ready-for-review.yml) can promote that draft PR to ready-for-review when you are satisfied with it.
- Use the PM agent for drafting and refinement, and the workflow for repository automation.
