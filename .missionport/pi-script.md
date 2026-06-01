WHY (Semantic Layer)
  Intent: Build a constraint grammar for AI governance legible to non-experts.
  Provenance: M1-M4 complete. Now in real-world violation capture phase (M5 Dogfood).
  Prior decision: Melody-Maestro chosen as dogfood target over WorldCraft Visuals
  because it had the most active commit velocity.
  Reasoning gap: Constraint was too broadly scoped in M5 Violation #1 — the
  governance watcher caught its own installation. Fix: promote _GOVERNANCE_PY
  exclusion list into the constraint spec. The three violations required for M5
  must come from genuine governance drift.

WHAT (Constraint Set — Active)
  - No .py commits without README.md update in same 24hr window
    EXCLUDES: files in _GOVERNANCE_PY list (governance tooling files)
  - All constraint changes require a RESOLUTION TRACE
  - Violation log must be updated before session close
  - Triage tier must be declared in the Pi Script constraint, not inferred at runtime
    LOW severity: auto-close after defined window, no human action required
    HIGH / @priority:critical: blocked until human explicitly closes

BOUNDARIES (Agent Goals)
  - Capture violation #2 or #3 toward M5 gate
  - Do not begin M6 work until gate condition is met (3 genuine violations required)
  - Keep the _GOVERNANCE_PY exclusion list scoped correctly before next capture

PRECEDENCE (@priority: critical)
  - Human review required before any violation is closed
  - Resolver cannot release a constraint without explicit authorization
  - EMERGENCY_OVERRIDE must generate a flagged RESOLUTION TRACE — governance
    is deferred, not bypassed. Mandatory post-hoc review, cannot be dismissed.
