---
description: Branch, write, review, and ship notes or ideas following full project conventions
---

# Workflow: Branch, Write, Review, Ship

Use this workflow any time you want to capture and ship changes following full project conventions (branching, human review, CI, merge).

## Steps

1. Create a new date-prefixed branch reflecting the desired addition(s):

   ```bash
   git checkout -b $(date +%Y.%m.%d)/descriptive-branch-name && git push --set-upstream origin $(date +%Y.%m.%d)/descriptive-branch-name
   ```

2. Create or update the relevant files with the new content.

3. **Pause here** — give the human time to review the added content, confirm it looks right, and resolve any linter warnings before proceeding.

4. When the human gives the go-ahead, review all changes and create appropriate commits for all changed/unstaged items:
   - Stage only the relevant files
   - Use a semantic commit message (`docs:`, `feat:`, `fix:`, etc.)
   - Sign the commit with GPG (`git commit -S`)

5. Push the branch and create a PR:

   ```bash
   gh pr create --title "feat: <description>" --body "..."
   ```

   - PR title must follow Conventional Commits format (enforced by CI)

6. Walk the human through the diff — **do this before watching CI**:

   Pull the full diff and review it with the human in meaningful units (not necessarily line-by-line, but grouped by logical change). For each unit, explain:

   - **What changed** — describe the specific addition, removal, or modification
   - **Why it changed** — the intent or reasoning behind it
   - **How to validate it** — one of:
     - *Manual human review* (e.g., "read this section and confirm the framing is accurate")
     - *Automated test* (e.g., "run `npm test` to verify CI passes locally")
     - *Both* where appropriate

   To pull the diff for review:

   ```bash
   gh pr diff <PR_NUMBER>
   ```

7. Auto-approve the PR using the GitHub CLI, then watch CI:

   ```bash
   gh pr review <PR_NUMBER> --approve
   gh pr checks <PR_NUMBER> --watch
   ```

   > **Note:** GitHub blocks self-approval (`Review: Can not approve your own pull request`). On solo repos without required reviewers, skip the approve step and go straight to `gh pr checks --watch` — the merge will still succeed if branch protection doesn't require approval.

   - If CI passes, merge the PR and delete the remote branch:

     ```bash
     gh pr merge <PR_NUMBER> --merge --delete-branch
     ```

   - If CI fails, investigate and fix before merging

8. Switch to `main` and pull the latest code:

   ```bash
   git checkout main
   git pull
   ```

   > **Note:** This repo does not have an automated version-bump workflow. After merging, simply pull main — no CI run to wait for.
