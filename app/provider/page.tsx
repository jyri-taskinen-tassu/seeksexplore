// app/provider/page.tsx
import Link from "next/link";

type BadgeTone = "ok" | "attention" | "problem";

function Badge({
  tone,
  label,
}: {
  tone: BadgeTone;
  label: string;
}) {
  const styles: Record<BadgeTone, string> = {
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    attention: "border-amber-200 bg-amber-50 text-amber-800",
    problem: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[tone],
      ].join(" ")}
    >
      <span
        className={[
          "h-2 w-2 rounded-full",
          tone === "ok"
            ? "bg-emerald-500"
            : tone === "attention"
              ? "bg-amber-500"
              : "bg-red-500",
        ].join(" ")}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function Card({
  title,
  value,
  icon,
  hint,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
  tone?: BadgeTone;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-neutral-600">{title}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs text-neutral-500">{hint}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {tone ? <Badge tone={tone} label={tone === "ok" ? "OK" : tone === "attention" ? "Attention" : "Problem"} /> : null}
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-neutral-100 text-neutral-700">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 2v3M16 2v3M3.5 9h17M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 20a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTool() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3 3-2-2 3-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 14a4 4 0 0 1-4 4H9l-6 3V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Departure = {
  id: string;
  title: string;
  time: string;
  status: BadgeTone;
  booked: number;
  capacity: number;
  guide?: string;
  tags: string[];
  note?: string;
};

const demoDepartures: Departure[] = [
  {
    id: "d1",
    title: "Snowmobile Safari (Sport)",
    time: "10:00 – 12:30",
    status: "ok",
    booked: 8,
    capacity: 10,
    guide: "Maria K.",
    tags: ["Snowmobile", "Outdoor", "Fixed time"],
  },
  {
    id: "d2",
    title: "City Walk (English)",
    time: "12:00 – 13:30",
    status: "attention",
    booked: 2,
    capacity: 12,
    guide: "Jukka T.",
    tags: ["Walking", "Indoor/Outdoor", "Fixed time"],
    note: "Low fill",
  },
  {
    id: "d3",
    title: "E-bike Tour",
    time: "14:00 – 16:30",
    status: "problem",
    booked: 6,
    capacity: 6,
    guide: "Erik N.",
    tags: ["E-bikes", "Outdoor", "Fixed time"],
    note: "Size L overallocated",
  },
  {
    id: "d4",
    title: "Private Sauna Experience",
    time: "On request",
    status: "attention",
    booked: 0,
    capacity: 8,
    tags: ["On request", "Indoor"],
    note: "Lead time 24h",
  },
];

function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-neutral-100">
      <div
        className="h-2 rounded-full bg-neutral-900"
        style={{ width: `${v}%` }}
        aria-label={`Progress ${v}%`}
      />
    </div>
  );
}

export default function ProviderDashboardPage() {
  const totalDepartures = 6;
  const totalGuests = 42;
  const guidesActive = { used: 8, total: 12 };

  // Equipment example: show warning if used > available
  const equipment = { used: 32, available: 28 };
  const equipmentTone: BadgeTone =
    equipment.used > equipment.available ? "problem" : equipment.used / equipment.available >= 0.85 ? "attention" : "ok";

  const statusSummary: BadgeTone = equipmentTone === "problem" ? "attention" : "ok";

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-900 text-white">
              <IconCalendar />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-neutral-900">
                Provider Dashboard
              </div>
              <div className="text-sm text-neutral-500">
                Today: Monday, January 20, 2025
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge tone={statusSummary} label={statusSummary === "ok" ? "All good" : "Needs attention"} />
            <Link
              href="/provider/availability"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Open availability
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Add departure
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6">
        {/* KPI cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card
            title="Departures (today)"
            value={`${totalDepartures}`}
            hint="Fixed time + on request"
            icon={<IconCalendar />}
            tone="ok"
          />
          <Card
            title="Guests (today)"
            value={`${totalGuests}`}
            hint="Across all activities"
            icon={<IconUsers />}
            tone="ok"
          />
          <Card
            title="Guides active"
            value={`${guidesActive.used} / ${guidesActive.total}`}
            hint="Assigned vs available"
            icon={<IconUsers />}
            tone={guidesActive.used / guidesActive.total >= 0.85 ? "attention" : "ok"}
          />
          <Card
            title="Equipment used"
            value={`${equipment.used} / ${equipment.available}`}
            hint={equipment.used > equipment.available ? "Overbook risk" : "OK"}
            icon={<IconTool />}
            tone={equipmentTone}
          />
        </section>

        {/* Main split */}
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Departures list */}
          <div className="xl:col-span-2 rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-6 py-4">
              <div>
                <div className="text-base font-semibold text-neutral-900">
                  Today’s activities
                </div>
                <div className="text-sm text-neutral-500">
                  One view for departures, fill and issues.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  aria-label="Previous day"
                  title="Previous day"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  aria-label="Next day"
                  title="Next day"
                >
                  →
                </button>
              </div>
            </div>

            <div className="divide-y divide-neutral-200">
              {demoDepartures.map((d) => {
                const pct =
                  d.capacity > 0 ? Math.round((d.booked / d.capacity) * 100) : 0;

                return (
                  <div
                    key={d.id}
                    className="flex flex-col gap-3 px-6 py-4 hover:bg-neutral-50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Badge tone={d.status} label={d.status === "ok" ? "OK" : d.status === "attention" ? "Attention" : "Problem"} />
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-neutral-900">
                          {d.title}
                        </div>
                        <div className="mt-0.5 text-sm text-neutral-600">
                          {d.time}
                          {d.guide ? (
                            <span className="text-neutral-400">
                              {" "}
                              • Guide: {d.guide}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {d.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {d.note ? (
                          <div className="mt-2 text-xs text-neutral-500">
                            {d.note}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="w-full md:w-[320px]">
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span className="mono">
                          {d.booked}/{d.capacity} guests
                        </span>
                        <span className="mono">{pct}%</span>
                      </div>
                      <div className="mt-2">
                        <Progress value={pct} />
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action required */}
          <aside className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-neutral-900">
                Action required
              </div>
              <span className="text-xs text-neutral-500">Today</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      Equipment over capacity
                    </div>
                    <div className="mt-1 text-sm text-neutral-600">
                      Equipment used {equipment.used}/{equipment.available}
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">
                      Check snowmobiles / e-bikes variants.
                    </div>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-100 text-neutral-700">
                    <IconTool />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <Link
                    href="/provider/availability"
                    className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    Resolve
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      Low fill alert
                    </div>
                    <div className="mt-1 text-sm text-neutral-600">
                      City Walk is 2/12
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">
                      Decide: keep, reschedule or cancel.
                    </div>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-100 text-neutral-700">
                    <IconCalendar />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                    Review
                  </button>
                  <button className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">
                    Decide
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      Messages
                    </div>
                    <div className="mt-1 text-sm text-neutral-600">
                      3 customer questions
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">
                      Central inbox comes later (WA/Meta/Email).
                    </div>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-100 text-neutral-700">
                    <IconMessage />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <button className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                    Open messages
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-200 pt-4">
              <div className="text-sm font-semibold text-neutral-900">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/provider/availability"
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Availability & departures
                </Link>
                <Link
                  href="/provider/bookings"
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Upcoming bookings
                </Link>
                <Link
                  href="/provider/resources"
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Resources
                </Link>
              </div>
              <div className="mt-3 text-xs text-neutral-500">
                MVP note: no cross-provider bundling. Infrastructure only.
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
