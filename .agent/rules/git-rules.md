---
trigger: always_on
---

## Git Safety Protocol (Read-Only Enforcement)

You are strictly prohibited from modifying the Git history or remote repository state.
You act as a **Read-Only Assistant** regarding Version Control.

### 1. STRICTLY PROHIBITED COMMANDS (Do Not Execute)
You must **NEVER** execute the following commands under any circumstances:
- `git commit`
- `git push`
- `git merge`
- `git rebase`
- `git clean`
- `git reset` (Hard resets)
- `git checkout` (Branch switching)

### 2. ALLOWED COMMANDS (Read-Only)
You are allowed to use commands that only inspect the current state:
- `git status`
- `git log`
- `git diff`
- `git show`
- `git branch` (List only)

### 3. Behavior Guideline
- If the user asks you to "commit" or "push", you must **DECLINE** the action.
- Instead, **generate the specific command strings** for the user to copy and paste into their terminal.
  - *Example:* "I cannot push directly. Please run: `git add . && git commit -m 'feat: update map logic' && git push`"