# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Speed to Lead Autopilot** — automated lead qualification and response in <30 seconds. A single n8n workflow receives webhook inquiries (from API or the included HTML contact form), scores leads via LLM on 4 weighted criteria (0-100), logs to CRM (Google Sheets or HubSpot), sends personalized email responses, and notifies the team on Slack with priority tagging and response time. German-language system prompt with prompt injection defense.

## Before Any Work

- **Read `@AGENTS.md`** for session protocol (Beads task tracking, Landing the Plane, session completion rules)
- **Read `AGENTS.md`** for the n8nac workflow protocol (GitOps sync, research, validation, testing, error classification)
  - If `AGENTS.md` says "run n8nac init", do that first — it auto-generates the full protocol

## Tech Stack

- **n8n 2.11.2** — workflow automation
- **n8nac** — code-first workflow development (`.workflow.ts` TypeScript files with decorators)
- **Beads** (`bd`) — AI-native issue tracker and agent memory
- **Credentials**: OpenRouter (LLM via Gemini 2.0 Flash), Google Sheets OAuth2, Gmail OAuth2, Slack Bot Token

## Key Commands

```bash
# Workflow operations (must run `npx --yes n8nac init` first)
npx --yes n8nac list                                   # List all workflows with sync status
npx --yes n8nac pull <id>                              # Pull remote workflow before editing
npx --yes n8nac push <workflowDir>/file.workflow.ts    # Push — MUST use full path, not bare filename
npx --yes n8nac push <path> --verify                   # Push + validate in one step
npx --yes n8nac verify <id>                            # Validate live workflow against schema
npx --yes n8nac workflow activate <id>                 # Activate before testing
npx --yes n8nac test <id> --prod                       # Test webhook (always activate first)

# Research before creating/editing nodes
npx --yes n8nac skills search "node name"              # Find exact node type
npx --yes n8nac skills node-info <nodeName>            # Get exact parameter schema

# Scaffold new workflow from template
npm run new-workflow -- <category>/<slug> "Display Name"

# Secret scanning
npm run check-secrets                                  # Scan for leaked secrets
npm run check-secrets:staged                           # Scan staged files only

# Beads (issue tracking)
bd ready              # Start session — find available work
bd sync               # End session — persist state for next agent
```

## Architecture

Workflow files live in `workflows/<instance>/personal/` (path derived from `workflowDir` in `n8nac-config.json`). Three workflows exist:

- **speed-to-lead.workflow.ts** — main 10-node workflow (Google Sheets CRM): Webhook → AI Agent (LLM scorer + Structured Output Parser + AutoFix Model) → Prepare CRM Data → Google Sheets (all leads) + Switch (score-based routing) → Gmail (hot/warm/cold) → Slack (hot/warm with response time)
- **speed-to-lead-hubspot.workflow.ts** — HubSpot CRM variant (11 nodes): same scoring/routing, replaces Google Sheets with HubSpot Contact (all leads) + Deal (hot/warm only)
- **setup-crm-sheet.workflow.ts** — utility to create the CRM spreadsheet

Additional files: `static/contact-form.html` (standalone HTML form that POSTs to the webhook), `test-leads.json` (10 calibrated mock leads with expected scores and verified numeric results).

Lead scoring uses 4 weighted criteria (0-100 total): Budget (0-30), Urgency (0-25), Service-Match (0-25), Decision-Maker (0-20). Score thresholds: >70=hot, 40-70=warm, 10-39=cold, <10=spam. The Structured Output Parser enforces JSON schema with `autoFix: true` via a dedicated AutoFix Model sub-node.

## Critical Rules

- **Push requires full path**: `npx --yes n8nac push workflows/.../file.workflow.ts` — bare filenames are rejected
- **Always pull before editing** existing workflows — OCC will reject stale pushes
- **Init required**: Must run `npx --yes n8nac init` before any n8nac workflow commands
- **Always activate then test with `--prod`** — bare `test <id>` requires manual arming in n8n editor
- **Error classification**: Class A (credentials/config) → tell user, don't edit code. Class B (wiring) → fix and re-push
- **autoFix needs its own LLM**: `outputParserStructured` with `autoFix: true` requires a dedicated `ai_languageModel` sub-node connected via `.uses()` — it won't use the parent Agent's model
- **n8n Code node limitations**: `$execution.startedAt` is NOT available in Code nodes. Use `Date.now()` and `$execution.customData.set()` for timing. Response time tracking uses live `Date.now()` in Slack expressions
- **Session end**: Always run `bd sync` then `git push` — Landing the Plane protocol
- **Never leave unpushed work** — work isn't done until `git push` succeeds
