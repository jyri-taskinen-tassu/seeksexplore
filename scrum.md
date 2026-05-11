# Scrum Process — SeeksExplore

## Team

| Person | Role | Responsibilities |
| ------ | ---- | ---------------- |
| Dev 1 | Co-founder / Engineer | Full-stack, infra, DB, AI features |
| Dev 2 | Co-founder / Engineer | Full-stack, UI, product features |
| CEO | Co-founder / Product Owner | Backlog prioritization, stakeholder feedback, acceptance |

Small team rule: **no ceremony for ceremony's sake.** Every meeting has a hard time limit and a clear output.

---

## Rhythm — 1-Week Sprints

One week is the right cadence for two devs. Long enough to ship something real; short enough to catch drift early.

```
Monday      Sprint Planning       (60 min)
Wed/Thu     Mid-sprint sync       (15 min, async-first)
Friday      Demo + Retrospective  (45 min)
```

---

## Monday — Sprint Planning (60 min)

**Who:** All three.

**Agenda:**

1. CEO presents top priorities from backlog (10 min)
2. Devs pull items from the top of the backlog into the sprint (20 min)
3. Each item gets a quick size estimate: S / M / L (5 min)
4. Devs split ownership — who takes what (10 min)
5. Sprint goal written in one sentence (5 min)
6. Any blockers or dependencies called out (10 min)

**Output:** A sprint board with a clear goal and owned tickets.

**Capacity rule:** Two devs × 5 days = 10 dev-days. Subtract 1 day per dev for review, meetings, and unexpected bugs. Plan for **8 dev-days** per sprint.

---

## Wednesday — Mid-Sprint Sync (15 min)

**Who:** Both devs (CEO optional, async update via Slack/Notion).

**Format:** Three questions each:
1. What did I ship since Monday?
2. What will I finish before Friday?
3. Is anything blocked?

If a blocker needs the CEO (product decision, access, etc.) — flag it immediately, don't wait for Friday.

**Skip it** if both devs are heads-down and on track. The goal is to surface drift, not fill a calendar.

---

## Friday — Demo + Retro (45 min)

**Who:** All three.

**Demo (20 min):**
- Each dev shows what they built, live in the browser
- CEO accepts or flags issues against the sprint goal
- Anything not demoed is not done — no "it's almost ready"

**Retro (25 min):**

| Question | Time |
| -------- | ---- |
| What worked well this sprint? | 8 min |
| What slowed us down? | 8 min |
| One thing we change next sprint | 5 min |
| Backlog grooming — quick pass at upcoming items | 4 min |

One retro action item max. More than one means none get done.

---

## Backlog

### Who owns it

The **CEO owns the backlog** — prioritization, adding new items, killing items that no longer matter. Devs can add technical items (refactors, infra, bugs) but the CEO ranks them against product items.

### Item format

```
Title: [short imperative — "Add product status toggle"]
Goal: Why does this matter right now?
Acceptance: How do we know it's done? (specific, testable)
Size: S (< 0.5 day) | M (0.5–1 day) | L (1–2 days)
Phase: Phase 0 | 1 | 2 | 3 | 4 | 5
```

Anything larger than L gets broken down before it enters a sprint.

### Backlog tiers

```
Now     → Current sprint items (owned, sized, accepted criteria written)
Next    → Next 1–2 sprints (rough, needs sizing before pulling in)
Later   → Phase 3+ work (ideas, not commitments)
Icebox  → Parked — revisit quarterly
```

---

## Ticket Lifecycle

```
Backlog → In Progress → In Review → Done
```

- **In Progress:** One ticket per dev at a time. Start a new one only after the current is in review.
- **In Review:** Opened as a PR. Other dev reviews within 24 hours. CEO reviews UI changes.
- **Done:** PR merged to `develop`, demo'd on Friday, CEO accepted.

---

## Definition of Done

A ticket is **Done** when all of these are true:

- [ ] PR merged to `develop` (passed lint + type-check + build)
- [ ] Works in staging (not just localhost)
- [ ] No TypeScript errors introduced
- [ ] CEO has seen it and not flagged a blocker
- [ ] If a DB migration: migration file committed and applied to staging

---

## Where Work Lives

| Thing | Tool |
| ----- | ---- |
| Backlog + sprint board | GitHub Projects (free, same repo) |
| Async comms | Slack (or iMessage for a tiny team) |
| Decisions / product notes | Notion or a `decisions/` folder in the repo |
| PR reviews | GitHub |
| Demo recordings (optional) | Loom |

Keep it in one place. Don't split context across four tools.

---

## PR Rules for This Team

- Every feature goes through a PR — no direct pushes to `develop`, `staging`, or `main`
- Other dev reviews within **24 hours** (block time for this, don't let it queue up)
- CEO reviews **UI-facing PRs** before merge to staging — tag them in the PR
- One approval is enough to merge to `develop`
- Two approvals (both devs) to merge to `staging` or `main`

---

## Roles in Detail

### CEO — Product Owner

- Maintains and ranks the backlog
- Writes acceptance criteria for product items
- Available for product questions during the sprint (within a few hours, not days)
- Does not add scope mid-sprint — if something urgent comes in, it goes to the top of Next, not the current sprint
- Communicates with early users and brings feedback to Monday planning

### Dev 1 & Dev 2 — Development Team

- Pull their own tickets; no one assigns work to them
- Raise blockers same day, not on Friday
- Each owns the full stack for their ticket (frontend + backend + migration)
- Review each other's PRs honestly — not rubber-stamping
- If both devs disagree on approach, spend 15 min max then pick one and move on

---

## Handling Interruptions

**Bug reported by a user or CEO mid-sprint:**

- If it blocks someone from using the product → drop current ticket, fix it, ship it
- If it's annoying but not blocking → add to top of Next, address next sprint
- If it's cosmetic → add to backlog, rank later

**New idea from CEO mid-sprint:**

- Write it down in the backlog
- Do not start it until next sprint planning
- If it's genuinely more important than the sprint goal, call a 15-min replanning session — don't just silently swap tickets

---

## Sprint Zero (Before Phase 0 Code)

The first sprint is setup — no features, just foundations:

- [ ] GitHub Projects board created with backlog columns
- [ ] Branch protection rules applied (`main`, `staging`, `develop`)
- [ ] PR template committed (`.github/pull_request_template.md`)
- [ ] Supabase projects created: local, staging, prod
- [ ] Vercel projects created: staging + prod, linked to branches
- [ ] Environment variables set in Vercel
- [ ] CI workflow committed (lint + type-check + build on every PR)
- [ ] `commitlint` + `husky` installed and working locally
- [ ] Everyone can run `npm run dev` against local Supabase successfully

Sprint Zero is done when all three people can see a staging deployment at a real URL.

---

## Quarterly Check-In

Every 12 sprints (~3 months), step back from the weekly rhythm:

1. Are we building the right thing? (CEO-led, 30 min)
2. What phases are complete? What's left?
3. Do we need to hire? Change the process? Kill a feature area?
4. Update the roadmap in `plan.md`

This is not a retro — it's a strategy conversation.

---

> **Core principle:** The process exists to serve the product, not the other way around. If a ceremony isn't adding value, cut it. If a rule is slowing you down without catching real problems, change it at the next retro.
