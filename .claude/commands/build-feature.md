# Build Feature

Build a feature end-to-end from a Linear issue ID: fetch spec, move ticket In Progress, implement, branch, commit, PR.

## Usage

```
/build-feature <ISSUE-ID>
```

Example: `/build-feature SEE-35` or `/build-feature SEE-35 SEE-36`

---

## Steps (execute in order, no skipping)

### 1. Fetch issue(s) from Linear

Use `mcp__linear-server__get_issue` for each ID passed as argument.

- If issue has sub-issues, fetch those too with `mcp__linear-server__list_issues` (parentId = main issue).
- Focus only on sub-issues with status **Todo** or **In Progress** — skip Done ones.
- Read description and acceptance criteria carefully.

### 2. Move ticket(s) to In Progress

Use `mcp__linear-server__save_issue` to set state = "In Progress" on every issue you will work on.

Do this BEFORE writing any code.

### 3. Check current codebase state

- Read relevant files based on the issue description.
- Check existing routes, components, DB schema as needed.
- Use Supabase MCP (`mcp__supabase__list_tables`, `mcp__supabase__execute_sql`) to inspect schema if the feature touches the DB.

### 4. Plan then implement

Think through what needs to change before touching files. Then build:

- **DB changes**: create migration file at `migrations/<timestamp>_<description>.sql`, apply via `mcp__supabase__execute_sql`. Follow RLS rules — providers need SELECT + INSERT + UPDATE + DELETE policies where relevant. Schema: `seeks_and_explore_demo`, project ref: `vmmntdvmfmooklchpqvq`.
- **API routes**: `app/api/provider/...` — always auth-check with `supabase.auth.getUser()`, verify provider ownership via `provider_users` table.
- **UI**: match existing brand/style — neutral palette, rounded-xl borders, consistent with other provider pages.
- **Rich text**: use `TiptapEditor` component (`app/components/provider/TiptapEditor.tsx`) for any description/content fields. Render with `dangerouslySetInnerHTML` + `rich-text` CSS class on display.

### 5. Run Prettier on every changed file

```bash
npx prettier --write "<file1>" "<file2>" ...
```

Must run before committing. No exceptions.

### 6. Create branch

```bash
git checkout -b feat/<short-name>/<issue-id>
```

If multiple issues: `feat/<short-name>/<id1>-<id2>`

Branch off `exploring`, not `main`.

### 7. Commit

Conventional commits format:
```
feat: <short description> (<ISSUE-IDs>)

<body: what changed and why, if non-obvious>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Stage only relevant files — never `git add -A` blindly.

### 8. Push and create PR

```bash
git push -u origin <branch>
gh pr create --base exploring --title "feat: ..." --body "..."
```

PR body must include:
- **Summary** (bullet list of what changed)
- **Test plan** (checklist)
- Issue references: `Closes SEE-XX`
- Footer: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

### 9. Report back

After PR is created, output:
- PR URL
- List of issues moved to In Progress
- What was built (2-3 bullets)

**DO NOT mark any Linear issue as Done.** Leave all at In Progress. User verifies PRs manually and will provide a list — only then mark Done.

---

## Rules (always enforced)

- PRs target `exploring`, never `main`
- Prettier on every changed file before commit
- RLS on every new DB table in exposed schema
- Auth check on every API route
- Never mark Linear issues Done — only In Progress while working
- Use `mcp__supabase__execute_sql` for DB iteration; `apply_migration` only for final DDL
