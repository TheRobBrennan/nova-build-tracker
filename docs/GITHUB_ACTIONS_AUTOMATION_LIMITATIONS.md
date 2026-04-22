# GitHub Actions Automation Limitations

## Overview

This document outlines critical limitations and solutions for GitHub Actions automation, specifically around branch protection rules and automated workflows.

## The Problem

GitHub Actions cannot automatically push to protected branches when certain branch protection rules are enabled, even with proper permissions.

## Specific Limitations

### Branch Protection Conflicts

When branch protection is enabled with these settings, GitHub Actions automation will fail:

#### 1. Required Pull Requests

- **Setting**: "Require pull request before merging"
- **Impact**: Blocks direct pushes from GitHub Actions
- **Error**: `! [remote rejected] main -> main (protected branch hook declined)`

#### 2. Required Status Checks

- **Setting**: "Require status checks to pass before merging"
- **Impact**: Blocks pushes until all checks pass
- **Error**: `remote: - X of Y required status checks are expected`

#### 3. Strict Status Checks

- **Setting**: "Require branches to be up to date before merging"
- **Impact**: Requires PR-based workflow
- **Error**: `GH006: Protected branch update failed`

## Solutions

### Option 1: Disable Blocking Rules (Recommended for Automation)

For automated workflows that need to push directly to main:

**Disable these settings:**

- [ ] "Require pull request before merging"
- [ ] "Require status checks to pass before merging"
- [ ] "Require branches to be up to date before merging"

**Keep these settings:**

- [x] "Require approvals" (maintains human oversight)
- [x] "Require conversation resolution" (maintains collaboration)

### Option 2: PR-Based Automation

Keep full branch protection and design workflows to:
1. Create pull requests
2. Wait for status checks
3. Merge automatically after checks pass

**Limitations:**

- More complex workflow design
- Still may fail due to GitHub API restrictions
- Creates additional PR noise

### Option 3: Hybrid Approach

Use different branches for different purposes:
- **Protected main**: Manual merges only
- **Automation branch**: Automated updates
- **Periodic sync**: Merge automation branch to main

## Our Implementation

We chose **Option 1** for the automated version bump workflow:

```yaml
# .github/workflows/version-bump.yml
- name: Update Versions and Commit
  run: |
    # Update versions
    npm version ${{ steps.bump-type.outputs.bump_type }} --no-git-tag-version
    
    # Commit and push directly to main
    git add package.json services/*/package.json
    git commit -m "chore: version bump ${{ steps.bump-type.outputs.bump_type }} [skip ci]"
    git push origin main
```

## Security Considerations

### What We Sacrificed

- Automated status check validation
- PR review requirement for automated changes

### What We Maintained

- Human approval requirements for manual PRs
- Signed commit requirements
- Audit trail of all changes

### Why This Is Acceptable

- Automated changes are version bumps only (low risk)
- All changes are clearly marked with `[skip ci]`
- Human oversight still required for functional changes
- Full audit trail maintained

## Best Practices

### For Automated Workflows

1. **Use `[skip ci]`** for automated commits to prevent workflow loops
2. **Clear commit messages** indicating automation source
3. **Limited scope** - only automate low-risk changes
4. **Testing** - thoroughly test automated workflows
5. **Monitoring** - monitor for failures or unexpected behavior

### For Repository Security

1. **Document exceptions** - clearly document why automation bypasses protection
2. **Regular reviews** - periodically review automated changes
3. **Fallback plans** - have manual processes if automation fails
4. **Access control** - limit who can modify automation workflows

## Troubleshooting

### Common Errors

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: - Changes must be made through a pull request.
remote: - X of Y required status checks are expected.
! [remote rejected] main -> main (protected branch hook declined)
```

**Solution**: Disable "Require pull request before merging" and "Require status checks to pass before merging" in branch protection settings.

### Verification Commands

```bash
# Check current branch protection settings
gh api repos/OWNER/REPO/branches/main/protection

# Test workflow manually
gh workflow run WORKFLOW_NAME

# Monitor workflow execution
gh run list --workflow=WORKFLOW_NAME
```

## Conclusion

GitHub Actions automation and branch protection can coexist, but require careful configuration. The key is understanding which specific protection rules block automation and adjusting them appropriately while maintaining security where it matters most.

For our use case (automated version bumping), disabling the blocking rules while keeping approval requirements provides the right balance of automation and security.
