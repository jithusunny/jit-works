# Documentation map

Keep only durable, current product knowledge here. GitHub issues own work, status, and unresolved choices.

## Put knowledge here when

- `specs/`: current cross-cutting behavior or contracts that several changes must understand. Create the directory when the first real specification is needed.
- `adr/`: accepted, important, hard-to-reverse technical decisions.
- A focused guide or runbook: a repeated contributor, deployment, recovery, or operational procedure.

## Keep it elsewhere when

- Work, ownership, status, a risk, or an unresolved decision: GitHub issue.
- Implemented behavior: code and tests first; update a specification only when one exists.
- Dated evidence used across choices: a short research note linked by the relevant issue.
- Raw brainstorms, customer details, commercial reasoning, credentials, or other sensitive context: do not commit them here. Provide a sanitized standalone requirement when they affect public work.

Avoid roadmap files, duplicate status lists, meeting transcripts, and completed plans. If a document stops being a current source of truth, remove or replace it deliberately.
