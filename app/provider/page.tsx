import Link from "next/link";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { createClient } from "@/lib/supabase/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

type BadgeTone = "ok" | "attention" | "problem";

function Badge({ tone, label }: { tone: BadgeTone; label: string }) {
  const styles: Record<BadgeTone, string> = {
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    attention: "border-[var(--terracotta)]/20 bg-[var(--terracotta)]/5 text-[var(--terracotta-dark)]",
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
              ? "bg-[var(--terracotta)]"
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
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-[var(--ink-sub)]">{title}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs text-[var(--ink-sub)] opacity-70">{hint}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {tone ? (
            <Badge
              tone={tone}
              label={
                tone === "ok"
                  ? "OK"
                  : tone === "attention"
                    ? "Attention"
                    : "Problem"
              }
            />
          ) : null}
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--cream-50)] text-[var(--green-900)]">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function IconCalendar() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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

type ProductWithTags = {
  id: string;
  capacity_max: number | null;
  resources: unknown;
  product_tags: { tag: string }[];
};

type ResourceAvailability = {
  category_id: string;
  category_name: string;
  variant_id: string;
  variant_name: string;
  total_units: number;
  booked_units: number;
};

function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-[var(--cream-100)]">
      <div
        className="h-2 rounded-full bg-[var(--green-800)]"
        style={{ width: `${v}%` }}
        aria-label={`Progress ${v}%`}
      />
    </div>
  );
}

export default async function ProviderDashboardPage() {
  const provider = await getProviderForUser();
  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream-50)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--green-900)]">Access Denied</h1>
          <p className="mt-2 text-[var(--ink-sub)]">Please log in as a provider to access the dashboard.</p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-lg bg-[var(--green-800)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--green-900)]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const providerId = (provider as { id: string }).id;
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // 1. Fetch Today's Bookings
  const { data: bookings } = await supabase
    .schema(SCHEMA)
    .from("bookings")
    .select("*")
    .eq("provider_id", providerId)
    .eq("booking_date", today)
    .neq("status", "cancelled");

  // 2. Fetch Resource Availability
  const { data: resourceAvailability } = await supabase
    .schema(SCHEMA)
    .rpc("get_resource_availability", {
      p_date: today,
      p_provider_id: providerId,
    });

  // 3. Fetch Products for capacity and tags
  const { data: products } = await supabase
    .schema(SCHEMA)
    .from("products")
    .select("id, capacity_max, resources, product_tags(tag)")
    .eq("provider_id", providerId) as { data: ProductWithTags[] | null };

  const productCount = products?.length ?? 0;

  // 4. Calculate KPIs
  const totalGuests = bookings?.reduce((acc, b) => acc + (b.guests || 0), 0) ?? 0;
  
  // Group bookings into "activities" (unique product + time slot)
  const activityMap = new Map<string, Departure>();
  
  bookings?.forEach((b) => {
    const key = `${b.product_id || "manual"}-${b.booking_time}`;
    if (!activityMap.has(key)) {
      const product = products?.find((p) => p.id === b.product_id);
      const tags = product?.product_tags?.map((t) => t.tag) || [];
      
      activityMap.set(key, {
        id: key,
        title: b.product_name || "Unknown Activity",
        time: b.booking_time,
        status: "ok",
        booked: 0,
        capacity: product?.capacity_max || 0,
        tags: tags.slice(0, 3),
      });
    }
    const activity = activityMap.get(key)!;
    activity.booked += b.guests || 0;
    
    // Check if overbooked
    if (activity.capacity > 0 && activity.booked > activity.capacity) {
      activity.status = "problem";
      activity.note = "Overbooked";
    } else if (activity.capacity > 0 && activity.booked / activity.capacity < 0.2) {
      activity.status = "attention";
      activity.note = "Low fill";
    }
  });

  const todayActivities = Array.from(activityMap.values()).sort((a, b) => 
    a.time.localeCompare(b.time)
  );

  const totalDepartures = todayActivities.length;

  // Equipment calculation
  const totalUnits = (resourceAvailability as ResourceAvailability[])?.reduce((acc, r) => acc + (r.total_units || 0), 0) ?? 0;
  const bookedUnits = (resourceAvailability as ResourceAvailability[])?.reduce((acc, r) => acc + (r.booked_units || 0), 0) ?? 0;
  
  const equipment = { used: bookedUnits, available: totalUnits };
  const equipmentTone: BadgeTone =
    equipment.used > equipment.available
      ? "problem"
      : equipment.available > 0 && equipment.used / equipment.available >= 0.85
        ? "attention"
        : "ok";

  // Action Required
  const actionItems: Array<{
    title: string;
    description: string;
    hint: string;
    icon: React.ReactNode;
    tone: BadgeTone;
    actionLabel: string;
    actionHref?: string;
  }> = [];

  if (equipmentTone === "problem") {
    actionItems.push({
      title: "Equipment over capacity",
      description: `Equipment used ${equipment.used}/${equipment.available}`,
      hint: "Check specific resource variants for overbooking.",
      icon: <IconTool />,
      tone: "problem",
      actionLabel: "Resolve",
      actionHref: "/provider/availability",
    });
  }

  todayActivities.forEach(a => {
    if (a.status === "problem") {
      actionItems.push({
        title: "Overbooking alert",
        description: `${a.title} is ${a.booked}/${a.capacity}`,
        hint: "Consider adding capacity or moving guests.",
        icon: <IconCalendar />,
        tone: "problem",
        actionLabel: "Review",
      });
    } else if (a.status === "attention" && a.note === "Low fill") {
       actionItems.push({
        title: "Low fill alert",
        description: `${a.title} is ${a.booked}/${a.capacity}`,
        hint: "Decide: keep, reschedule or cancel.",
        icon: <IconCalendar />,
        tone: "attention",
        actionLabel: "Decide",
      });
    }
  });

  const statusSummary: BadgeTone =
    actionItems.some(i => i.tone === "problem") ? "problem" : 
    actionItems.some(i => i.tone === "attention") ? "attention" : "ok";

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      {/* Top bar */}
      <header className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--green-900)] text-white">
              <IconCalendar />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-[var(--green-900)]">
                {(provider as { official_name?: string } | null)
                  ?.official_name ?? "Provider Dashboard"}
              </div>
              <div className="text-sm text-[var(--ink-sub)]">
                {new Date().toLocaleDateString("en-FI", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              tone={statusSummary}
              label={
                statusSummary === "ok" 
                  ? "All good" 
                  : statusSummary === "attention"
                    ? "Needs attention"
                    : "Action required"
              }
            />
            {(provider as { provider_slug?: string } | null)?.provider_slug ? (
              <a
                href={`/book/${(provider as { provider_slug?: string } | null)?.provider_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Booking page
              </a>
            ) : null}
            <Link
              href="/provider/availability"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
            >
              Open availability
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--green-800)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--green-900)] transition-colors"
            >
              Add booking
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
            hint="Based on confirmed bookings"
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
            title="Products"
            value={`${productCount}`}
            hint="Active products"
            icon={<IconTool />}
            tone="ok"
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
          <div className="xl:col-span-2 rounded-xl border border-[var(--line)] bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-6 py-4">
              <div>
                <div className="text-base font-semibold text-[var(--green-900)]">
                  Today’s activities
                </div>
                <div className="text-sm text-[var(--ink-sub)]">
                  {"Today's bookings and resource usage at a glance."}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-[var(--green-900)] px-3 py-2 text-sm font-medium text-white shadow-sm"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
                >
                  →
                </button>
              </div>
            </div>

            <div className="divide-y divide-[var(--line)]">
              {todayActivities.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--cream-100)] text-[var(--green-900)]">
                    <IconCalendar />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-[var(--ink)]">No activities today</h3>
                  <p className="mt-1 text-sm text-[var(--ink-sub)]">New bookings for today will appear here.</p>
                </div>
              ) : (
                todayActivities.map((d) => {
                  const pct =
                    d.capacity > 0
                      ? Math.round((d.booked / d.capacity) * 100)
                      : 0;

                  return (
                    <div
                      key={d.id}
                      className="flex flex-col gap-3 px-6 py-4 hover:bg-[var(--cream-50)] md:flex-row md:items-center md:justify-between transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Badge
                            tone={d.status}
                            label={
                              d.status === "ok"
                                ? "OK"
                                : d.status === "attention"
                                  ? "Attention"
                                  : "Problem"
                            }
                          />
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-[var(--ink)]">
                            {d.title}
                          </div>
                          <div className="mt-0.5 text-sm text-[var(--ink-sub)]">
                            {d.time}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {d.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-xs text-[var(--ink-sub)]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>

                          {d.note ? (
                            <div className="mt-2 text-xs text-[var(--terracotta-dark)] font-medium">
                              {d.note}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="w-full md:w-[320px]">
                        <div className="flex items-center justify-between text-xs text-[var(--ink-sub)]">
                          <span className="font-mono">
                            {d.booked}/{d.capacity} guests
                          </span>
                          <span className="font-mono">{pct}%</span>
                        </div>
                        <div className="mt-2">
                          <Progress value={pct} />
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-[var(--green-900)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shadow-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action required */}
          <aside className="rounded-xl border border-[var(--line)] bg-[var(--cream-100)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-[var(--green-900)]">
                Action required
              </div>
              <span className="text-xs text-[var(--ink-sub)]">Today</span>
            </div>

            <div className="mt-4 space-y-3">
              {actionItems.length === 0 ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                  <div className="text-sm font-medium text-emerald-800">All systems green</div>
                  <p className="mt-1 text-xs text-emerald-600">No issues detected for today.</p>
                </div>
              ) : (
                actionItems.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-[var(--line)] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[var(--ink)]">
                          {item.title}
                        </div>
                        <div className="mt-1 text-sm text-[var(--ink-sub)]">
                          {item.description}
                        </div>
                        <div className="mt-2 text-xs text-[var(--ink-sub)] opacity-70">
                          {item.hint}
                        </div>
                      </div>
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--cream-50)] text-[var(--green-900)]">
                        {item.icon}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      {item.actionHref ? (
                        <Link
                          href={item.actionHref}
                          className="rounded-lg bg-[var(--green-900)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 shadow-sm"
                        >
                          {item.actionLabel}
                        </Link>
                      ) : (
                        <button className="rounded-lg bg-[var(--green-900)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 shadow-sm">
                          {item.actionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Message card remains for now as placeholder */}
              <div className="rounded-xl border border-[var(--line)] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[var(--ink)]">
                      Messages
                    </div>
                    <div className="mt-1 text-sm text-[var(--ink-sub)]">
                      No new customer questions
                    </div>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--cream-50)] text-[var(--green-900)]">
                    <IconMessage />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--line)] pt-4">
              <div className="text-sm font-semibold text-[var(--green-900)]">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/provider/availability"
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
                >
                  Availability
                </Link>
                <Link
                  href="/provider/bookings"
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
                >
                  Upcoming bookings
                </Link>
                <Link
                  href="/provider/resources"
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
                >
                  Resources
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

