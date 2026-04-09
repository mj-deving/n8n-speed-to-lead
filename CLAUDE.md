# CLAUDE.md — n8n Project

## Before Any Work

- **Read `@AGENTS.md`** for session protocol (Beads task tracking, Landing the Plane, session completion rules)
- **Read `AGENTS.md`** for the n8nac workflow protocol (GitOps sync, research, validation, testing, error classification)
  - If `AGENTS.md` says "run n8nac init", do that first — it auto-generates the full protocol

## Tech Stack

- **n8n** — workflow automation (connect via `npx --yes n8nac init`)
- **n8nac** — code-first workflow development (`.workflow.ts` format)
- **Beads** (`bd`) — AI-native issue tracker and agent memory

## Key Commands

```bash
# Workflow operations
npx --yes n8nac list                    # List all workflows
npx --yes n8nac push <file>.workflow.ts # Push to n8n
npx --yes n8nac verify <id>            # Validate live workflow
npx --yes n8nac test <id> --prod       # Test webhook workflows

# Scaffold
npm run new-workflow -- <category>/<slug> "Display Name"

# Beads
bd ready              # Start session — find available work
bd sync               # End session — persist state for next agent
```

## Critical Rules

- **Push filename only**: `npx --yes n8nac push workflow.ts` — no paths
- **Init required**: Must run `npx --yes n8nac init` before pull/push
- **Session end**: Always run `bd sync` then `git push` — Landing the Plane protocol
- **Never leave unpushed work** — work isn't done until `git push` succeeds
