# MissionPort

**Bridge NotebookLM to your developer workspace.**

A VS Code extension that closes the context gap between where you think (NotebookLM) and where you build (VS Code). MissionPort injects structured mission context directly into your AI agent sessions — so every session begins with full awareness of the architecture, constraints, and governance intent behind the work.

---

## The Problem

Every AI coding session starts from zero. The agent doesn't know your project's governance rules, architecture constraints, or the intent behind decisions made in previous sessions. It solves the immediate problem while potentially violating the deeper intent. The code compiles — but the governance fails.

MissionPort closes that gap.

---

## How It Works

MissionPort reads structured context files from a `.missionport/` folder in your workspace and injects them into your agent session using a four-layer format:

| Layer | What It Carries |
| --- | --- |
| **WHY** (Semantic Layer) | The intent behind the rules — not just what's constrained, but why |
| **WHAT** (Constraint Set) | Active constraints, declared states, and forbidden/required behaviors |
| **BOUNDARIES** (Agents & Goals) | Hard behavioral limits for the session — the agent's scope |
| **PRECEDENCE** (@priority) | Critical constraints that cannot be overridden without human authorization |

---

## Current State — v0.0.1 (Workaround Prototype)

NotebookLM does not currently expose a public API. This version uses a local folder approach as a functional bridge until one exists.

**What's built:**

- VS Code sidebar panel listing `.missionport/*.md` context files
- Freshness indicator — green check (ready) or yellow warning (stale, >24h)
- Status bar item showing active context file count
- `MissionPort: Pull Mission Context` command — assembles and copies the full four-layer context block to clipboard, ready to paste into any AI agent session
- File watcher — sidebar updates automatically when `.missionport/` files change

**The workaround flow:**

1. Export summaries and key content from NotebookLM as Markdown
2. Place them in the `.missionport/` folder in your workspace root
3. Run `MissionPort: Pull Mission Context` from the command palette
4. Paste the context block into your agent session

**Known limitation:** The manual export step cannot be automated until a NotebookLM API exists. Stale context for critical constraints is flagged but not hard-blocked in this version.

---

## Folder Structure

```text
.missionport/
  pi-script.md        <- Grammar spec + milestone status
  continuum.md        <- Loop architecture + human review protocol
  rift.md             <- Intent-to-policy design spec
  creative-os.md      <- North Star declaration + violation types
  melody-maestro.md   <- Active governance rules + dogfood context
  _session.json       <- Active notebook, injection timestamp, agent target
```

---

## Getting Started

**Requirements:** Node.js 18+, VS Code 1.90+

```bash
npm install
npm run compile
```

Press `F5` in VS Code (or **Run > Start Debugging**) to launch the Extension Development Host.

Add `.md` files to a `.missionport/` folder in any workspace. The sidebar will detect them automatically.

---

## Roadmap

- [ ] Browser extension layer — reads NotebookLM page content and syncs to `.missionport/` folder automatically
- [ ] Two-tier staleness enforcement — advisory warning for informational context, hard-fail block for `@priority: critical` constraints
- [ ] `_session.json` integration — track injection timestamp and active notebook per session
- [ ] NotebookLM API integration (when available) — `.missionport/` folder becomes a live API cache

---

## Architecture

MissionPort is part of a broader governance stack:

```text
NotebookLM  ->  .missionport/  ->  MissionPort for VS Code (Claude Code)
                               ->  MissionPort for Claude.ai (planning layer)
```

One folder. One source of truth. All AI surfaces read from here.

---

MissionPort Concept Brief v1.4 | GodSpeed313 | May 2026
