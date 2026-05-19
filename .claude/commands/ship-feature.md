# Ship Feature

Merge a PR, mark Linear tickets Done, pull exploring branch.

## Usage

```
/ship-feature <ISSUE-ID> [ISSUE-ID ...]
/ship-feature <PR-NUMBER> <ISSUE-ID> [ISSUE-ID ...]
```

Examples:
- `/ship-feature SEE-36` — PR number resolved from Linear
- `/ship-feature SEE-36 SEE-37` — multi-issue, PR resolved from first issue
- `/ship-feature 2 SEE-36 SEE-37` — explicit PR number (legacy / override)

---

## Steps (execute in order)

### 0. Resolve PR number (skip if PR number was explicitly provided)

If only issue IDs were given (first arg starts with `SEE-` or similar), resolve the PR number from Linear:

1. Use `mcp__linear-server__list_comments` with the first issue's ID.
2. Find the comment containing `🌿 Branch:` and `🔗 PR:`.
3. Extract the PR URL from that comment.
4. Parse the PR number from the URL: last path segment of `https://github.com/.../pull/<number>`.

If no such comment exists, fall back: use `mcp__linear-server__get_attachment` — list attachments on the issue and find one with `title` starting with `Pull Request`. Read `metadata.pr` for the number.

If still not found, stop and ask the user to provide the PR number explicitly.

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
