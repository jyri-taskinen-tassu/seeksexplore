# Ship Feature

Merge a PR, mark Linear tickets Done, pull exploring branch.

## Usage

```
/ship-feature <PR-NUMBER> <ISSUE-ID> [ISSUE-ID ...]
```

Example: `/ship-feature 2 SEE-36 SEE-37`

---

## Steps (execute in order)

### 1. Merge PR

```bash
gh pr merge <PR-NUMBER> --squash --delete-branch
```

If merge fails (conflicts, checks failing) — stop and report the error. Do not force.

### 2. Pull exploring branch

```bash
git checkout exploring
git pull
```

### 3. Mark tickets Done

For every issue ID passed as argument:

1. Use `mcp__linear-server__save_issue` to set state = "Done".
2. Use `mcp__linear-server__list_issues` with `parentId = <issue-id>` to fetch sub-issues.
3. Mark every sub-issue Done as well (regardless of current status).

Recurse only one level — sub-issues of sub-issues are not touched.

### 4. Report back

Output:
- PR merged + branch deleted
- `exploring` pulled to commit SHA
- Issues marked Done (list them)
