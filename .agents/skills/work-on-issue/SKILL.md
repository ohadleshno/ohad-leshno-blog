---
name: work-on-issue
description: >
  Work on a single issue from the VF Analyzer issue tracker. Loads the issue
  file, identifies which repo(s) are in scope, implements the work test-first,
  and moves the issue to the done/ folder when all acceptance criteria are met.
  Use whenever the user says "implement issue X", "work on issue X", or picks
  an issue file from .scratch/vf-analyzer/issues/.
---

# Work on Issue — AL VF Analyzer

> **Not sure which skill to use, or how to route a situation not covered here?**
> Use **`ask-matt`** — it is the routing skill for this entire engineering toolkit.
> It maps every situation (bug, foggy effort, incoming tickets, design question)
> to the right skill or flow. Reach for it any time you are unsure.

You are starting a fresh context window scoped to **one issue**. Read the issue
file completely before writing a single line of code.

---

## CRITICAL RULE: USER APPROVAL BEFORE COMMIT
**NEVER execute `git commit` or `git push` automatically.** Always wait for the user to explicitly review and approve the implemented code before creating any git commits or pushing to remote repositories.

---

## 0. Boot sequence (run every time)

1. **Read the issue file** the user pointed at (or the one they named).
   - Note the issue ID (e.g. `02`, `05b`), title, acceptance criteria checklist,
     and `Blocked by:` list.
2. **Verify blockers are done**: for each issue listed under `Blocked by:`,
   confirm the corresponding file exists in
   `.scratch/vf-analyzer/issues/done/`. If any blocker is missing, stop and
   tell the user which blocker must be completed first.
3. **Identify repos in scope** using the matrix below.
4. **Read `AGENTS.md`** at `.agents/AGENTS.md` (workspace rules). Re-read any
   section relevant to the repos you are about to touch.
5. **Load referenced skills**: Use `view_file` to explicitly load and read
   the instructions of the referenced skills: `implement`, `tdd`, and
   `code-review`.
6. **Load repo coding-style skills** for each in-scope app repo:
   - Backend → `al-vf-analyzer-backend/.agents/skills/backend-coding-style/SKILL.md`
   - Frontend → `al-vf-analyzer-frontend/.agents/skills/frontend-coding-style/SKILL.md`


### Repo scope matrix

| Issue topic keywords                             | Repo(s) to touch              |
|--------------------------------------------------|-------------------------------|
| VPC, ECS, ALB, WAF, SQS, S3, CloudWatch, KMS    | `al-vf-analyzer-infra`        |
| Aurora, RDS, Prisma, schema, migration           | `al-vf-analyzer-infra` + `al-vf-analyzer-backend` |
| Cognito, auth, JWT, RBAC                         | `al-vf-analyzer-infra` + `al-vf-analyzer-backend` (auth module) |
| API endpoint, controller, adapter, module        | `al-vf-analyzer-backend`      |
| UI, component, chart, map, form                  | `al-vf-analyzer-frontend`     |
| OpenAPI, client types                            | `al-vf-analyzer-backend` + `al-vf-analyzer-frontend` |

---

## 1. Understand before you build

- Restate the acceptance criteria in your own words.
- Identify the **module** (for backend) or **Terraform module** (for infra)
  that owns this work.
- For backend: locate the module's public interface file. Write or extend the
  interface *first*, before any implementation.
- For infra: identify which `.tf` file(s) are affected.
- For frontend: identify which component(s) and service files are affected.

---

## 2. Implement — test-first at seams

Follow `/tdd` discipline:

1. Write a failing test at the **module's public interface** seam.
   - Backend: `tests/` directory; mock only external adapters (S3, Cognito,
     Bedrock, Textract, DB). Never mock module internals.
   - Frontend: component unit tests; mock only the API client.
2. Make it pass with the minimum implementation.
3. Refactor, keeping all tests green.
4. Repeat for each acceptance criterion.

**Multi-tenant cross-injection test** (required for every CRUD endpoint):
Add a test confirming that a request authenticated as Tenant A cannot read
or write Tenant B resources (must return 403).

---

## 3. Repo-specific rules (enforced, not suggestions)

### Backend (`al-vf-analyzer-backend`)
- Code lives in `src/modules/<module-name>/`. No logic in controllers.
- AWS calls (S3, Cognito, Bedrock, Textract, DB) sit behind an adapter
  interface. Every production adapter needs a matching `InMemory*Adapter`.
- PII masking (OCR-01/02): `extraction-pipeline` must black out name, ID, DOB
  before any external API call.
- DB queries must use the Tenant's schema/connection context. No cross-tenant
  joins.

### Infrastructure (`al-vf-analyzer-infra`)
- Multi-Region Lockout (LOC-01): Parameterize the target AWS region in all modules (do not hardcode `il-central-1`). Dynamic resource policies (e.g. S3 region lockouts) must match the environment's target region.
- Cell Boundary Isolation (MUL-01): Package database, Cognito, KMS, and queue resources into repeatable Cell modules to support dedicated secure deployments. Tenants within a cell are partitioned logically (Postgres database schemas, Cognito custom tenant attributes, and S3 folder prefixes).
- Backwards-compatible schema changes only (zero-downtime migration).
- Tag every resource with `environment` and `project`.
- **After every Terraform change, update `al-vf-analyzer-infra/INFRASTRUCTURE_DESIGN.md`**:
  - If a new AWS resource type is introduced, add or update the relevant section
    under `3. Layered Components` (e.g. a new `3.5 AI Services` section).
  - If the network topology changes, update the `mermaid` diagram in section 2.
  - If a new design decision or compliance constraint is added, record it in
    section 1 (Architectural Principles & Compliance).
  - The doc must always reflect the current state of the `.tf` files — never let
    it drift. Treat it as a living document, not a one-time write.


### Frontend (`al-vf-analyzer-frontend`)
- Sensitivity map orientation: OD blind spot on the LEFT, OS blind spot on the
  RIGHT (NFR-07). Validate this in tests.
- VFI projections must be labelled "statistical estimates for clinical support"
  with confidence ranges (VIS-08).
- Run `pnpm run generate-client` after any backend OpenAPI change. Never
  hand-write duplicate API types.

---

## 4. Run tests

```bash
# Backend
cd al-vf-analyzer-backend
pnpm test

# Frontend
cd al-vf-analyzer-frontend
pnpm test
```

All tests must be green before you declare the issue done.
Run typecheck for backend: `pnpm tsc --noEmit`

---

## 5. Code review

After all tests pass, run `/code-review` against the diff since the last commit
on the current branch. Fix any Standards or Spec findings before moving on.

---

## 6. Mark the issue as done ✅ (AFTER USER APPROVAL)

When **all acceptance criteria** are checked off and **the user explicitly approves the code**:

1. **Update the issue file** in place:
   - Change `**Status:** ready-for-agent` → `**Status:** done`
   - Check off every `- [ ]` → `- [x]`
   - Add a `**Completed:**` date and `**Evidence:**` section listing the key
     files changed.
   - Add a `**Gaps / Notes:**` section for anything intentionally deferred.

2. **Move the file** to the done folder:
   ```bash
   mv .scratch/vf-analyzer/issues/<issue-file>.md \
      .scratch/vf-analyzer/issues/done/<issue-file>.md
   ```

3. **Commit** your work ONLY after user approval:
   ```bash
   git add -A
   git commit -m "feat(<issue-id>): <short summary of what was built>"
   ```

---

## 7. Context hygiene

- This skill runs in a **fresh context window** per issue. Do not carry state
  between issues.
- If the issue is larger than the smart zone (~120k tokens), use `/handoff` to
  continue in a new session referencing the handoff file.
- Never start the next issue in the same context window. Each issue = one
  fresh window.

---

## 8. When in doubt — use `ask-matt`

This skill covers the standard implement-and-close loop. If you encounter
anything outside that scope, **stop and use `ask-matt`**:

| Situation | What `ask-matt` will route you to |
|-----------|-----------------------------------|
| Issue scope is unclear or design needs sharpening | `/grill-with-docs` |
| Something is broken during implementation | `/diagnosing-bugs` |
| The issue turned out to be much bigger than one ticket | `/wayfinder` |
| You want to review the diff before committing | `/code-review` |
| You need to understand a module's shape or seam | `/codebase-design` |
| Context window is full | `/handoff` → new session |
