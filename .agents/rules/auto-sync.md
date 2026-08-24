---
description: Automatically sync workspace changes to GitHub origin main on task completion
---

# Vote-X Auto-Sync Rule

Whenever code changes, new features, bug fixes, or modifications are made to this repository:
1. Ensure no sensitive files (`.env`, private keys, secrets, API tokens) are created without being ignored.
2. Run `node scripts/auto-sync.js --once` or perform a clean Git add, commit with a descriptive message, safe pull/rebase, and push to `origin main`.
3. Never force push (`git push -f`).
4. Maintain clean working tree synchronized with `https://github.com/rishabh404-org/Vote-X.git`.
