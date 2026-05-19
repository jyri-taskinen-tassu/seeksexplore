---
name: linear-issue
description: This skill should be used when the user wants to "create a Linear issue", "log a user story", "add an issue to Linear", "create a sub-issue", "create a ticket", "log a feature", "log a bug to Linear", or says something like "create issue for X" or "log this to Linear". Always targets the Demo project in Seeks and Explore team.
version: 0.1.0
---

# Linear Issue Creator

Create well-formed Linear issues (user stories, bugs, features) for the Seeks and Explore / Demo project. Handles parent issues and sub-issues. Auto-assigns labels and assignee based on content.

## Workspace Constants

All fixed IDs are in `references/workspace.md`. Always load it before creating any issue.

**Never hardcode IDs in responses** — read from the reference file each time.

- Team: `Seeks and Explore`
- Project: `Demo` (always — no exceptions)
- Default assignee: `Tauheed Butt` (unless user specifies otherwise)

## Workflow

### Step 1: Parse User Input

Extract from what the user typed:
- What feature/area does this touch? (maps to label)
- Is this a bug, feature, or improvement?
- Should it be a sub-issue of an existing parent? (user may name one, or say "under SEE-XX")
- Who should own it? (default: Tauheed Butt)
- Priority? (default: No priority / 0)

If sub-issue is implied but no parent given, use `list_issues` on Demo project to find likely parents — show options and ask.

### Step 2: Draft Issue Content

Write the issue using this format:

```
**User story:** As a [role], I want [action] so that [outcome].

**Acceptance criteria:**
- [ ] ...
- [ ] ...
- [ ] ...

**Notes:** (optional — only if there's non-obvious context)
```

Apply `/humanizer` to all prose — description must sound human, not AI-generated. Keep it tight (caveman substance, human tone).

Do NOT add "Steps to reproduce" unless it's a bug. Do NOT add sections that will be empty.

### Step 3: Select Labels

Pick 1–3 labels from `references/workspace.md`. Rules:
- Always include the **area label** (Bookings, Products, Availability, etc.) that matches the feature
- Include `Feature`, `Bug`, or `Improvement` as the type label
- Include `Provider` if it's a provider dashboard feature (most things are)
- Do NOT pile on unrelated labels

### Step 4: Confirm Before Creating

Show a compact preview to the user:

```
Title: [title]
Labels: [label1, label2]
Assignee: [name]
Parent: [SEE-XX: title] or "none (top-level)"
Project: Demo
```

Ask: "Create?" — one word. If user says yes (or "yep", "do it", "go"), proceed.

### Step 5: Create via MCP

Use `mcp__linear-server__save_issue` with:
- `team`: `Seeks and Explore`
- `project`: `Demo`
- `title`: issue title
- `description`: formatted markdown body
- `labels`: array of label names (not IDs — MCP accepts names)
- `assignee`: user name or ID from workspace.md
- `parentId`: parent issue identifier (e.g. `SEE-12`) if sub-issue
- `state`: omit — do not set state on creation, leave as default (Todo)
- `priority`: as appropriate (default 0)

### Step 6: Report Result

Output the created issue identifier and URL. One line.

## Label Selection Guide

| User mentions... | Use label |
|---|---|
| bookings, reservations, trips | Bookings |
| products, activities, experiences | Products |
| availability, calendar, departures | Availability |
| customers, CRM, contacts | Customers |
| analytics, reports, charts | Analytics |
| resources, guides, staff | Resources |
| settings, config | Settings |
| login, auth, permissions | Auth |
| dashboard, overview | Dashboard |
| admin panel | Admin |
| new capability | Feature |
| broken, not working, error | Bug |
| improve, enhance, refine | Improvement |
| provider portal, operator view | Provider |

## Sub-Issue Logic

- If user says "under SEE-XX" or "sub-issue of [title]" → set `parentId` directly
- If user says "under the bookings feature" or similar → search issues, pick the matching parent, confirm with user
- If creating a parent issue: no `parentId`
- Sub-issues inherit the parent's area label; still add type label (Feature/Bug/Improvement)

## Title Format

Concise, imperative, no trailing period:
- Good: `Add cancellation flow to booking modal`
- Bad: `We need to add a cancellation flow to the booking modal.`

## Additional Resources

- **`references/workspace.md`** — all user IDs, label IDs, project IDs for this workspace
