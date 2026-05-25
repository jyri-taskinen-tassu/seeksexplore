"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { NewBookingModal } from "@/app/components/provider/NewBookingModal";

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
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold",
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
          <div className="text-sm font-bold text-[var(--ink)] opacity-70 mb-0.5 uppercase tracking-wider text-[10px]">
            {title}
          </div>
          <div className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--green-900)]">
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs font-bold text-[var(--ink)] opacity-50">{hint}</div>
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
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--cream-50)] text-[var(--green-900)] shadow-inner">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 2v3M16 2v3M3.5 9h17M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

function IconTool() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3 3-2-2 3-3Z" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 14a4 4 0 0 1-4 4H9l-6 3V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
    </svg>
  );
}

function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-[var(--cream-100)] border border-[var(--line)]/30 overflow-hidden shadow-inner">
      <div
        className="h-2 rounded-full bg-[var(--green-800)]"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

interface Departure {
  id: string;
  title: string;
  time: string;
  status: BadgeTone;
  booked: number;
  capacity: number;
  guide?: string;
  tags: string[];
  note?: string;
}

interface Booking {
  id: string;
  product_id: string | null;
  product_name: string;
  booking_time: string;
  guests: number;
  status: string;
  customer_name: string;
  customer_email: string;
  notes?: string | null;
}

interface Resource {
  category_id: string;
  category_name: string;
  variant_id: string;
  variant_name: string;
  total_units: number;
  booked_units: number;
}

interface Product {
  id: string;
  capacity_max: number | null;
  product_tags: { tag: string }[];
}

interface DashboardClientProps {
  provider: { id: string; official_name: string; provider_slug: string };
  initialBookings: Booking[];
  initialResources: Resource[];
  products: Product[];
}

export default function DashboardClient({
  provider,
  initialBookings,
  initialResources,
  products,
}: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowBookingModal] = useState(false);

  const fetchData = async (date: string) => {
    setLoading(true);
    try {
      const [bookingsRes, resourcesRes] = await Promise.all([
        fetch(`/api/provider/bookings?start=${date}&end=${date}`),
        fetch(`/api/provider/availability/resources?date=${date}`),
      ]);
      const [bookingsData, resourcesData] = await Promise.all([
        bookingsRes.json(),
        resourcesRes.json(),
      ]);
      setBookings(bookingsData.bookings || []);
      setResources(resourcesData.resources || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate !== new Date().toISOString().split("T")[0]) {
      fetchData(selectedDate);
    } else {
      setBookings(initialBookings);
      setResources(initialResources);
    }
  }, [selectedDate, initialBookings, initialResources]);

  const activityMap = useMemo(() => {
    const map = new Map<string, Departure>();
    bookings.filter(b => b.status !== 'cancelled').forEach((b) => {
      const key = `${b.product_id || "manual"}-${b.booking_time}`;
      if (!map.has(key)) {
        const product = products.find((p) => p.id === b.product_id);
        map.set(key, {
          id: key,
          title: b.product_name || "Unknown Activity",
          time: b.booking_time,
          status: "ok",
          booked: 0,
          capacity: product?.capacity_max || 0,
          tags: (product?.product_tags || []).map((t) => t.tag).slice(0, 3),
        });
      }
      const activity = map.get(key)!;
      activity.booked += b.guests || 0;
      if (activity.capacity > 0 && activity.booked > activity.capacity) {
        activity.status = "problem";
        activity.note = "Overbooked";
      } else if (activity.capacity > 0 && activity.booked / activity.capacity < 0.2) {
        activity.status = "attention";
        activity.note = "Low fill";
      }
    });
    return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
  }, [bookings, products]);

  const totalGuests = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.guests || 0), 0);
  const totalUnits = resources.reduce((s, r) => s + (r.total_units || 0), 0);
  const bookedUnits = resources.reduce((s, r) => s + (r.booked_units || 0), 0);
  
  const equipmentTone: BadgeTone = bookedUnits > totalUnits ? "problem" : totalUnits > 0 && bookedUnits / totalUnits >= 0.85 ? "attention" : "ok";

  const actionItems = useMemo(() => {
    const items = [];
    if (equipmentTone === "problem") {
      items.push({
        title: "Equipment over capacity",
        description: `Equipment used ${bookedUnits}/${totalUnits}`,
        hint: "Check specific resource variants for overbooking.",
        icon: <IconTool />,
        tone: "problem" as BadgeTone,
        actionLabel: "Resolve",
        actionHref: "/provider/availability",
      });
    }
    activityMap.forEach(a => {
      if (a.status === "problem") {
        items.push({
          title: "Overbooking alert",
          description: `${a.title} is ${a.booked}/${a.capacity}`,
          hint: "Consider adding capacity or moving guests.",
          icon: <IconCalendar />,
          tone: "problem" as BadgeTone,
          actionLabel: "Review",
          actionHref: "/provider/availability",
        });
      } else if (a.status === "attention" && a.note === "Low fill") {
        items.push({
          title: "Low fill alert",
          description: `${a.title} is ${a.booked}/${a.capacity}`,
          hint: "Decide: keep, reschedule or cancel.",
          icon: <IconCalendar />,
          tone: "attention" as BadgeTone,
          actionLabel: "Decide",
          actionHref: "/provider/bookings",
        });
      }
    });
    return items;
  }, [equipmentTone, bookedUnits, totalUnits, activityMap]);

  const statusSummary: BadgeTone = actionItems.some(i => i.tone === "problem") ? "problem" : actionItems.some(i => i.tone === "attention") ? "attention" : "ok";

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <header className="border-b border-[var(--line)] bg-white sticky top-0 z-10">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--green-900)] text-white shadow-lg">
              <IconCalendar />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-[var(--green-900)]">
                {provider.official_name}
              </div>
              <div className="text-sm font-bold text-[var(--ink)] opacity-60">
                {new Date(selectedDate).toLocaleDateString("en-FI", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge tone={statusSummary} label={statusSummary === "ok" ? "All good" : statusSummary === "attention" ? "Needs attention" : "Action required"} />
            <a href={`/book/${provider.provider_slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              Booking page
            </a>
            <Link href="/provider/availability" className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors">
              Open availability
            </Link>
            <button onClick={() => setShowBookingModal(true)} type="button" className="inline-flex items-center justify-center rounded-lg bg-[var(--green-800)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--green-900)] transition-all shadow-md">
              Add booking
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card title="Departures (today)" value={`${activityMap.length}`} hint="Based on confirmed bookings" icon={<IconCalendar />} tone="ok" />
          <Card title="Guests (today)" value={`${totalGuests}`} hint="Across all activities" icon={<IconUsers />} tone="ok" />
          <Card title="Products" value={`${products.length}`} hint="Active products" icon={<IconTool />} tone="ok" />
          <Card title="Equipment used" value={`${bookedUnits} / ${totalUnits}`} hint={bookedUnits > totalUnits ? "Overbook risk" : "OK"} icon={<IconTool />} tone={equipmentTone} />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-xl border border-[var(--line)] bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-6 py-4 bg-[var(--cream-50)]/30">
              <div>
                <div className="text-base font-bold text-[var(--green-900)]">
                  {selectedDate === todayStr ? "Today’s activities" : selectedDate === tomorrowStr ? "Tomorrow’s activities" : "Planned activities"}
                </div>
                <div className="text-sm font-bold text-[var(--ink)] opacity-60">
                  {"Bookings and resource usage at a glance."}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => changeDate(-1)} className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors">←</button>
                <button onClick={() => setSelectedDate(todayStr)} className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors ${selectedDate === todayStr ? 'bg-[var(--green-900)] text-white shadow-md' : 'bg-white border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--cream-50)]'}`}>Today</button>
                <button onClick={() => setSelectedDate(tomorrowStr)} className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors ${selectedDate === tomorrowStr ? 'bg-[var(--green-900)] text-white shadow-md' : 'bg-white border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--cream-50)]'}`}>Tomorrow</button>
                <button onClick={() => changeDate(1)} className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors">→</button>
              </div>
            </div>

            <div className={`divide-y divide-[var(--line)] transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              {activityMap.length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--cream-100)] text-[var(--green-900)] mb-4">
                    <IconCalendar />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--ink)]">No activities planned</h3>
                  <p className="mt-1 text-sm font-bold text-[var(--ink)] opacity-50">New bookings for this date will appear here.</p>
                </div>
              ) : (
                activityMap.map((d) => {
                  const pct = d.capacity > 0 ? Math.round((d.booked / d.capacity) * 100) : 0;
                  return (
                    <div key={d.id} className="flex flex-col gap-3 px-6 py-5 hover:bg-[var(--cream-50)]/50 md:flex-row md:items-center md:justify-between transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="mt-1"><Badge tone={d.status} label={d.status === "ok" ? "OK" : d.status === "attention" ? "Attention" : "Problem"} /></div>
                        <div>
                          <div className="text-sm font-bold text-[var(--ink)]">{d.title}</div>
                          <div className="mt-0.5 text-xs font-bold text-[var(--ink)] opacity-60 uppercase tracking-wide">{d.time}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {d.tags.map((t: string) => <span key={t} className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[10px] font-bold text-[var(--ink)] opacity-70 uppercase tracking-tight">{t}</span>)}
                          </div>
                          {d.note && <div className="mt-3 text-xs text-[var(--terracotta-dark)] font-extrabold flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--terracotta)]" /> {d.note}</div>}
                        </div>
                      </div>
                      <div className="w-full md:w-[320px]">
                        <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)] mb-2">
                          <span className="opacity-70">{d.booked}/{d.capacity} guests</span>
                          <span>{pct}%</span>
                        </div>
                        <Progress value={pct} />
                        <div className="mt-4 flex items-center justify-end gap-2">
                          <button type="button" className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors">View</button>
                          <button type="button" className="rounded-lg bg-[var(--green-900)] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity shadow-sm">Edit</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <aside className="rounded-xl border border-[var(--line)] bg-[var(--cream-100)] p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-base font-bold text-[var(--green-900)] uppercase tracking-wider text-xs opacity-70">Action required</div>
              <span className="text-[10px] font-extrabold text-[var(--ink)] opacity-50 uppercase tracking-widest">Today</span>
            </div>

            <div className="space-y-4">
              {actionItems.length === 0 ? (
                <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 p-6 text-center shadow-sm">
                  <div className="text-sm font-bold text-emerald-800">All systems green</div>
                  <p className="mt-1 text-xs font-medium text-emerald-700">No issues detected for today.</p>
                </div>
              ) : (
                actionItems.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-[var(--ink)]">{item.title}</div>
                        <div className="mt-1 text-sm font-bold text-[var(--ink)] opacity-60 leading-relaxed">{item.description}</div>
                        <div className="mt-2 text-[10px] font-bold text-[var(--ink)] opacity-50 italic">{item.hint}</div>
                      </div>
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--cream-50)] text-[var(--green-900)] shadow-inner">{item.icon}</div>
                    </div>
                    <div className="mt-4 flex items-center justify-end">
                      <Link href={item.actionHref} className="rounded-lg bg-[var(--green-900)] px-4 py-2 text-xs font-bold text-white hover:opacity-90 shadow-sm transition-opacity">
                        {item.actionLabel}
                      </Link>
                    </div>
                  </div>
                ))
              )}

              <div className="rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-[var(--ink)]">Messages</div>
                    <div className="mt-1 text-sm font-bold text-[var(--ink)] opacity-60">No new customer questions</div>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--cream-50)] text-[var(--green-900)] shadow-inner"><IconMessage /></div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--line)]">
              <div className="text-[10px] font-bold text-[var(--ink)] opacity-50 uppercase tracking-widest mb-4">Quick actions</div>
              <div className="grid gap-2">
                <Link href="/provider/availability" className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors shadow-sm text-center">Availability</Link>
                <Link href="/provider/bookings" className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors shadow-sm text-center">Upcoming bookings</Link>
                <Link href="/provider/resources" className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors shadow-sm text-center">Resources</Link>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {showModal && (
        <NewBookingModal
          onClose={() => setShowBookingModal(false)}
          onCreated={() => {
            setShowBookingModal(false);
            fetchData(selectedDate);
          }}
          prefilledDate={selectedDate}
        />
      )}
    </div>
  );
}
