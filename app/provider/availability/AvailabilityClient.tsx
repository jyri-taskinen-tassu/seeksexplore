"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DbDeparture = {
  id: string;
  provider_id: string;
  product_id: string | null;
  title: string;
  departure_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  duration_minutes: number | null;
  guest_capacity: number | null;
  guests_booked: number;
  status: string;
  guide_name: string | null;
  notes: string | null;
  resources: {
    snowmobiles?: Record<string, number>;
    ebikes?: Record<string, number>;
    guides?: number;
  };
  created_at: string;
  updated_at: string;
};

type UiStatus = "ok" | "attention" | "problem";

type UiDeparture = {
  id: string;
  title: string;
  time: string; // HH:MM
  guestsBooked: number;
  guestsCap: number;
  status: UiStatus;
  resourceUse: {
    SM?: { used: number; cap: number };
    "E-bike"?: { used: number; cap: number };
    Guides?: { used: number; cap: number };
  };
  notes: string | null;
  hasEbikes: boolean;
  raw: DbDeparture;
};

type DayData = {
  date: string;
  dayNumber: number;
  departures: UiDeparture[];
  inMonth: boolean;
  conflicts: string[];
};

// Resource capacities
const CAPACITY = { snowmobiles: 28, ebikes: 20, guides: 12 } as const;

const ACTIVITY_OPTIONS = [
  "Snowmobile Safari (Sport)",
  "Snowmobile Safari (Touring)",
  "E-bike Tour",
  "Northern Lights Tour",
  "Husky Safari",
  "Reindeer Farm Visit",
  "Ice Fishing Experience",
  "Snowshoe Hike",
  "Aurora Photography Tour",
  "Sauna & Ice Swimming",
  "City Walk (English)",
  "City Walk (Finnish)",
  "Reindeer Sleigh Ride",
  "Evening Sauna Experience",
  "Cross-Country Skiing",
  "Food Market Experience",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatMonthTitle(year: number, monthIndex0: number): string {
  return new Date(year, monthIndex0, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function parseTime(t: string): string {
  // DB returns "HH:MM:SS", normalise to "HH:MM"
  return t.slice(0, 5);
}

function computeStatus(dep: DbDeparture): UiStatus {
  const fillRate = dep.guest_capacity
    ? dep.guests_booked / dep.guest_capacity
    : 0;
  if (dep.status === "cancelled") return "problem";
  if (
    (dep.notes?.toLowerCase().includes("conflict") ||
      dep.notes?.toLowerCase().includes("exceeds")) &&
    dep.status !== "scheduled"
  )
    return "problem";
  if (fillRate < 0.3 && dep.guest_capacity && dep.guest_capacity > 0)
    return "attention";
  if (dep.guest_capacity && dep.guests_booked >= dep.guest_capacity)
    return "attention";
  return "ok";
}

function toUiDeparture(dep: DbDeparture): UiDeparture {
  const status = computeStatus(dep);
  const resourceUse: UiDeparture["resourceUse"] = {};

  const smTotal = dep.resources.snowmobiles
    ? Object.values(dep.resources.snowmobiles).reduce((s, n) => s + (n || 0), 0)
    : 0;
  if (smTotal > 0)
    resourceUse.SM = { used: smTotal, cap: CAPACITY.snowmobiles };

  const ebikeTotal = dep.resources.ebikes
    ? Object.values(dep.resources.ebikes).reduce((s, n) => s + (n || 0), 0)
    : 0;
  const hasEbikes = ebikeTotal > 0;
  if (hasEbikes)
    resourceUse["E-bike"] = { used: ebikeTotal, cap: CAPACITY.ebikes };

  const guides = dep.resources.guides ?? 0;
  if (guides > 0) resourceUse.Guides = { used: guides, cap: CAPACITY.guides };

  return {
    id: dep.id,
    title: dep.title,
    time: parseTime(dep.start_time),
    guestsBooked: dep.guests_booked,
    guestsCap: dep.guest_capacity ?? 0,
    status,
    resourceUse,
    notes: dep.notes,
    hasEbikes,
    raw: dep,
  };
}

function computeConflicts(departures: UiDeparture[]): string[] {
  let totalSM = 0;
  let totalEbike = 0;
  let totalGuides = 0;

  for (const d of departures) {
    totalSM += d.resourceUse.SM?.used ?? 0;
    totalEbike += d.resourceUse["E-bike"]?.used ?? 0;
    totalGuides += d.resourceUse.Guides?.used ?? 0;
  }

  const conflicts: string[] = [];
  if (totalSM > CAPACITY.snowmobiles)
    conflicts.push(
      `Snowmobiles: ${totalSM}/${CAPACITY.snowmobiles} — over capacity`,
    );
  if (totalEbike > CAPACITY.ebikes)
    conflicts.push(`E-bikes: ${totalEbike}/${CAPACITY.ebikes} — over capacity`);
  if (totalGuides > CAPACITY.guides)
    conflicts.push(`Guides: ${totalGuides}/${CAPACITY.guides} — over capacity`);
  return conflicts;
}

function aggregateStatus(departures: UiDeparture[]): UiStatus {
  if (departures.some((d) => d.status === "problem")) return "problem";
  if (departures.some((d) => d.status === "attention")) return "attention";
  return "ok";
}

function generateMonthGrid(year: number, monthIndex0: number) {
  const first = new Date(year, monthIndex0, 1);
  const startDow = (first.getDay() + 6) % 7;
  const startDate = new Date(year, monthIndex0, 1 - startDow);
  const grid: Array<{ date: Date; dayNumber: number; inMonth: boolean }> = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    grid.push({
      date: d,
      dayNumber: d.getDate(),
      inMonth: d.getMonth() === monthIndex0,
    });
  }
  return grid;
}

function getWeekDates(anchorDate: Date): string[] {
  const dayOfWeek = (anchorDate.getDay() + 6) % 7;
  const monday = new Date(anchorDate);
  monday.setDate(anchorDate.getDate() - dayOfWeek);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatISO(d));
  }
  return dates;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: UiStatus }) {
  const map = {
    ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    attention: "bg-amber-50 text-amber-700 ring-amber-200",
    problem: "bg-red-50 text-red-700 ring-red-200",
  } as const;
  const label =
    status === "ok" ? "OK" : status === "attention" ? "Attention" : "Problem";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1",
        map[status],
      )}
    >
      <span
        className={cx(
          "h-2 w-2 rounded-full",
          status === "ok" && "bg-emerald-500",
          status === "attention" && "bg-amber-500",
          status === "problem" && "bg-red-500",
        )}
      />
      {label}
    </span>
  );
}

function ResourceChip({
  label,
  used,
  cap,
}: {
  label: string;
  used: number;
  cap: number;
}) {
  const over = used > cap;
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-lg px-3 py-1 text-xs ring-1",
        over
          ? "bg-red-50 text-red-700 ring-red-200"
          : "bg-neutral-50 text-neutral-700 ring-neutral-200",
      )}
      title={`${label} ${used}/${cap}`}
    >
      {label} {used}/{cap}
    </span>
  );
}

// ─── DayCell ──────────────────────────────────────────────────────────────────

function DayCell({
  day,
  selected,
  onSelect,
}: {
  day: DayData;
  selected: boolean;
  onSelect: (d: DayData) => void;
}) {
  const hasDepartures = day.departures.length > 0;
  const status = hasDepartures ? aggregateStatus(day.departures) : "ok";
  const inMonth = day.inMonth;
  const totalGuests = day.departures.reduce((s, d) => s + d.guestsBooked, 0);
  const activityCount = new Set(day.departures.map((d) => d.title)).size;
  const hasConflicts = day.conflicts.length > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cx(
        "relative w-full text-left p-3 min-h-[110px] border border-neutral-200 transition",
        inMonth
          ? "bg-white hover:bg-neutral-50"
          : "bg-neutral-50 text-neutral-400",
        selected && "ring-2 ring-neutral-900",
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={cx(
            "text-sm font-medium",
            selected
              ? "text-neutral-900"
              : inMonth
                ? "text-neutral-800"
                : "text-neutral-400",
          )}
        >
          {day.dayNumber}
        </div>
        <div className="flex items-center gap-1.5">
          {hasConflicts && inMonth && (
            <span className="text-red-600 text-xs" title="Resource conflicts">
              ⚠️
            </span>
          )}
          {hasDepartures && inMonth && (
            <span
              className={cx(
                "h-2 w-2 rounded-full",
                status === "ok" && "bg-emerald-500",
                status === "attention" && "bg-amber-500",
                status === "problem" && "bg-red-500",
              )}
            />
          )}
        </div>
      </div>

      {hasDepartures && inMonth ? (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-neutral-900">
            {day.departures.length}{" "}
            {day.departures.length === 1 ? "departure" : "departures"}
          </div>
          {activityCount > 0 && (
            <div className="text-[11px] text-neutral-600">
              {activityCount} {activityCount === 1 ? "activity" : "activities"}
            </div>
          )}
          {totalGuests > 0 && (
            <div className="text-[11px] text-neutral-600">
              {totalGuests} {totalGuests === 1 ? "person" : "people"}
            </div>
          )}
        </div>
      ) : inMonth ? (
        <div className="mt-4 text-xs text-neutral-400">No departures</div>
      ) : null}
    </button>
  );
}

// ─── DepartureRow ─────────────────────────────────────────────────────────────

function DepartureRow({
  d,
  onClick,
}: {
  d: UiDeparture;
  onClick: (dep: UiDeparture) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(d)}
      className="w-full text-left rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 hover:bg-neutral-50 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cx(
                "h-2.5 w-2.5 rounded-full shrink-0",
                d.status === "ok" && "bg-emerald-500",
                d.status === "attention" && "bg-amber-500",
                d.status === "problem" && "bg-red-500",
              )}
            />
            <div className="font-medium text-neutral-900">{d.title}</div>
          </div>
          <div className="mt-1 text-sm text-neutral-600">
            {d.time} • {d.guestsBooked}/{d.guestsCap} guests
            {d.hasEbikes && (
              <span className="ml-2 text-xs text-neutral-500">(3h buffer)</span>
            )}
          </div>
          {d.notes && (
            <div
              className={cx(
                "mt-2 text-sm",
                d.notes.toLowerCase().includes("conflict") ||
                  d.notes.toLowerCase().includes("exceeds")
                  ? "text-red-600 font-medium"
                  : "text-neutral-500",
              )}
            >
              {d.notes}
            </div>
          )}
        </div>
        <span
          className={cx(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium ring-1",
            d.status === "ok" &&
              "bg-emerald-50 text-emerald-700 ring-emerald-200",
            d.status === "attention" &&
              "bg-amber-50 text-amber-700 ring-amber-200",
            d.status === "problem" && "bg-red-50 text-red-700 ring-red-200",
          )}
        >
          {d.status === "ok"
            ? "OK"
            : d.status === "attention"
              ? "Attention"
              : "Problem"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {d.resourceUse.SM && (
          <ResourceChip
            label="SM"
            used={d.resourceUse.SM.used}
            cap={d.resourceUse.SM.cap}
          />
        )}
        {d.resourceUse["E-bike"] && (
          <ResourceChip
            label="E-bike"
            used={d.resourceUse["E-bike"].used}
            cap={d.resourceUse["E-bike"].cap}
          />
        )}
        {d.resourceUse.Guides && (
          <ResourceChip
            label="Guides"
            used={d.resourceUse.Guides.used}
            cap={d.resourceUse.Guides.cap}
          />
        )}
      </div>
    </button>
  );
}

// ─── WeekView ─────────────────────────────────────────────────────────────────

function WeekView({
  weekDates,
  allDepartures,
  selectedDate,
  onSelectDay,
  onDepartureClick,
}: {
  weekDates: string[];
  allDepartures: DbDeparture[];
  selectedDate: string;
  onSelectDay: (date: string) => void;
  onDepartureClick: (dep: UiDeparture) => void;
}) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDates.map((date, idx) => {
        const deps = allDepartures
          .filter((d) => d.departure_date === date)
          .map(toUiDeparture)
          .sort((a, b) => a.time.localeCompare(b.time));
        const dayNum = new Date(date + "T00:00:00").getDate();

        return (
          <div
            key={date}
            className="border border-neutral-200 rounded-lg bg-white"
          >
            <div
              className={cx(
                "border-b border-neutral-200 px-3 py-2 text-sm font-medium",
                date === selectedDate && "bg-neutral-900 text-white",
              )}
            >
              <div>{dayNames[idx]}</div>
              <div className="text-xs font-normal">{dayNum}</div>
            </div>
            <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
              {deps.length === 0 ? (
                <div className="text-xs text-neutral-400 text-center py-4">
                  No departures
                </div>
              ) : (
                deps.map((dep) => (
                  <button
                    key={dep.id}
                    onClick={() => {
                      onSelectDay(date);
                      onDepartureClick(dep);
                    }}
                    className="w-full text-left p-2 rounded border border-neutral-200 hover:bg-neutral-50 transition"
                  >
                    <div className="text-xs font-medium text-neutral-900">
                      {dep.time}
                    </div>
                    <div className="text-xs text-neutral-600 mt-0.5">
                      {dep.title}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {dep.guestsBooked}/{dep.guestsCap} guests
                    </div>
                    {dep.hasEbikes && (
                      <div className="text-[10px] text-neutral-400 mt-1">
                        +3h buffer
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AddDepartureModal (SEE-14) ───────────────────────────────────────────────

function AddDepartureModal({
  prefilledDate,
  onClose,
  onSaved,
}: {
  prefilledDate: string;
  onClose: () => void;
  onSaved: (dep: DbDeparture) => void;
}) {
  const [title, setTitle] = React.useState(ACTIVITY_OPTIONS[0]);
  const [date, setDate] = React.useState(prefilledDate);
  const [startTime, setStartTime] = React.useState("09:00");
  const [durationMinutes, setDurationMinutes] = React.useState(150);
  const [guestCapacity, setGuestCapacity] = React.useState(10);
  const [guideName, setGuideName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [snowmobiles, setSnowmobiles] = React.useState(0);
  const [ebikes, setEbikes] = React.useState(0);
  const [guides, setGuides] = React.useState(1);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const resources: DbDeparture["resources"] = {};
    if (snowmobiles > 0) resources.snowmobiles = { sport_1seat: snowmobiles };
    if (ebikes > 0) resources.ebikes = { standard: ebikes };
    if (guides > 0) resources.guides = guides;

    try {
      const res = await fetch("/api/provider/departures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          departure_date: date,
          start_time: startTime,
          duration_minutes: durationMinutes,
          guest_capacity: guestCapacity,
          guide_name: guideName || null,
          notes: notes || null,
          resources,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to save");
      }
      const j = await res.json();
      onSaved(j.departure as DbDeparture);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-base font-semibold text-neutral-900">
            Add Departure
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Activity */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Activity
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {ACTIVITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Start time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Duration + Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min={15}
                max={720}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Guest capacity
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={guestCapacity}
                onChange={(e) => setGuestCapacity(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Guide */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Guide name
            </label>
            <input
              type="text"
              value={guideName}
              onChange={(e) => setGuideName(e.target.value)}
              placeholder="e.g. Mikko Virtanen"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Resource allocation */}
          <div>
            <div className="text-xs font-medium text-neutral-700 mb-2">
              Resource allocation
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">
                  Snowmobiles (cap 28)
                </label>
                <input
                  type="number"
                  min={0}
                  max={28}
                  value={snowmobiles}
                  onChange={(e) => setSnowmobiles(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">
                  E-bikes (cap 20)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={ebikes}
                  onChange={(e) => setEbikes(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">
                  Guides (cap 12)
                </label>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={guides}
                  onChange={(e) => setGuides(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save departure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DepartureSlideOver (SEE-15) ──────────────────────────────────────────────

function DepartureSlideOver({
  departure,
  onClose,
  onSaved,
  onDeleted,
}: {
  departure: UiDeparture;
  onClose: () => void;
  onSaved: (dep: DbDeparture) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // Editable fields
  const [title, setTitle] = React.useState(departure.title);
  const [startTime, setStartTime] = React.useState(departure.time);
  const [durationMinutes, setDurationMinutes] = React.useState(
    departure.raw.duration_minutes ?? 150,
  );
  const [guestCapacity, setGuestCapacity] = React.useState(departure.guestsCap);
  const [guestsBooked, setGuestsBooked] = React.useState(
    departure.guestsBooked,
  );
  const [guideName, setGuideName] = React.useState(
    departure.raw.guide_name ?? "",
  );
  const [notes, setNotes] = React.useState(departure.raw.notes ?? "");
  const [status, setStatus] = React.useState(departure.raw.status);

  const [snowmobiles, setSnowmobiles] = React.useState(
    departure.resourceUse.SM?.used ?? 0,
  );
  const [ebikes, setEbikes] = React.useState(
    departure.resourceUse["E-bike"]?.used ?? 0,
  );
  const [guides, setGuides] = React.useState(
    departure.resourceUse.Guides?.used ?? 0,
  );

  async function handleSave() {
    setSaving(true);
    setError(null);

    const resources: DbDeparture["resources"] = {};
    if (snowmobiles > 0) resources.snowmobiles = { sport_1seat: snowmobiles };
    if (ebikes > 0) resources.ebikes = { standard: ebikes };
    if (guides > 0) resources.guides = guides;

    try {
      const res = await fetch(`/api/provider/departures/${departure.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          start_time: startTime,
          duration_minutes: durationMinutes,
          guest_capacity: guestCapacity,
          guests_booked: guestsBooked,
          guide_name: guideName || null,
          notes: notes || null,
          status,
          resources,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Save failed");
      }
      const j = await res.json();
      onSaved(j.departure as DbDeparture);
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      const res = await fetch(`/api/provider/departures/${departure.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error("Delete failed");
      }
      onDeleted(departure.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              {editing ? "Edit Departure" : "Departure Details"}
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              {departure.raw.departure_date} · {departure.time}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {!editing ? (
            // ─ View mode ─
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 text-base">
                  {departure.title}
                </h3>
                <StatusPill status={departure.status} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-neutral-500">Start time</div>
                  <div className="text-sm font-medium text-neutral-900 mt-0.5">
                    {departure.time}
                  </div>
                </div>
                {departure.raw.duration_minutes && (
                  <div>
                    <div className="text-xs text-neutral-500">Duration</div>
                    <div className="text-sm font-medium text-neutral-900 mt-0.5">
                      {departure.raw.duration_minutes} min
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-neutral-500">
                    Guests booked / capacity
                  </div>
                  <div className="text-sm font-medium text-neutral-900 mt-0.5">
                    {departure.guestsBooked} / {departure.guestsCap}
                  </div>
                </div>
                {departure.raw.guide_name && (
                  <div>
                    <div className="text-xs text-neutral-500">Guide</div>
                    <div className="text-sm font-medium text-neutral-900 mt-0.5">
                      {departure.raw.guide_name}
                    </div>
                  </div>
                )}
              </div>

              {/* Resources */}
              <div>
                <div className="text-xs font-medium text-neutral-700 mb-2">
                  Assigned resources
                </div>
                <div className="flex flex-wrap gap-2">
                  {departure.resourceUse.SM ? (
                    <ResourceChip
                      label="Snowmobiles"
                      used={departure.resourceUse.SM.used}
                      cap={departure.resourceUse.SM.cap}
                    />
                  ) : null}
                  {departure.resourceUse["E-bike"] ? (
                    <ResourceChip
                      label="E-bikes"
                      used={departure.resourceUse["E-bike"].used}
                      cap={departure.resourceUse["E-bike"].cap}
                    />
                  ) : null}
                  {departure.resourceUse.Guides ? (
                    <ResourceChip
                      label="Guides"
                      used={departure.resourceUse.Guides.used}
                      cap={departure.resourceUse.Guides.cap}
                    />
                  ) : null}
                  {!departure.resourceUse.SM &&
                    !departure.resourceUse["E-bike"] &&
                    !departure.resourceUse.Guides && (
                      <span className="text-sm text-neutral-500">None</span>
                    )}
                </div>
              </div>

              {/* Notes */}
              {departure.notes && (
                <div>
                  <div className="text-xs font-medium text-neutral-700 mb-1">
                    Notes
                  </div>
                  <p className="text-sm text-neutral-600">{departure.notes}</p>
                </div>
              )}
            </>
          ) : (
            // ─ Edit mode ─
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Activity
                </label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  {ACTIVITY_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Start time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    min={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Guests booked
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={guestsBooked}
                    onChange={(e) => setGuestsBooked(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Guest capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={guestCapacity}
                    onChange={(e) => setGuestCapacity(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Guide
                </label>
                <input
                  type="text"
                  value={guideName}
                  onChange={(e) => setGuideName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <div className="text-xs font-medium text-neutral-700 mb-2">
                  Resources
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">
                      Snowmobiles
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={28}
                      value={snowmobiles}
                      onChange={(e) => setSnowmobiles(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">
                      E-bikes
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={ebikes}
                      onChange={(e) => setEbikes(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">
                      Guides
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={guides}
                      onChange={(e) => setGuides(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-4 shrink-0">
          {!editing ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirmDelete) {
                    handleDelete();
                  } else {
                    setConfirmDelete(true);
                  }
                }}
                disabled={saving}
                className={cx(
                  "rounded-lg px-4 py-2 text-sm font-medium transition",
                  confirmDelete
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                )}
              >
                {confirmDelete ? "Confirm delete" : "Delete"}
              </button>
              {confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm text-neutral-500 hover:text-neutral-900"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ConflictDrillDown (SEE-16) ───────────────────────────────────────────────

function ConflictDrillDown({
  conflicts,
  dayDepartures,
  onClose,
  onDepartureClick,
}: {
  conflicts: string[];
  dayDepartures: UiDeparture[];
  onClose: () => void;
  onDepartureClick: (dep: UiDeparture) => void;
}) {
  // For each conflict, find departures that use the conflicting resource
  function getDepsForConflict(conflict: string): UiDeparture[] {
    const lower = conflict.toLowerCase();
    if (lower.includes("snowmobile")) {
      return dayDepartures.filter((d) => (d.resourceUse.SM?.used ?? 0) > 0);
    }
    if (lower.includes("e-bike")) {
      return dayDepartures.filter(
        (d) => (d.resourceUse["E-bike"]?.used ?? 0) > 0,
      );
    }
    if (lower.includes("guide")) {
      return dayDepartures.filter((d) => (d.resourceUse.Guides?.used ?? 0) > 0);
    }
    return [];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-base font-semibold text-red-900">
            Resource Conflicts
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {conflicts.map((conflict, idx) => {
            const deps = getDepsForConflict(conflict);
            return (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-500">⚠</span>
                  <span className="text-sm font-medium text-red-800">
                    {conflict}
                  </span>
                </div>
                <div className="space-y-2 pl-4">
                  {deps.map((dep) => (
                    <button
                      key={dep.id}
                      onClick={() => {
                        onClose();
                        onDepartureClick(dep);
                      }}
                      className="w-full text-left rounded-lg border border-red-100 bg-red-50 px-4 py-3 hover:bg-red-100 transition"
                    >
                      <div className="text-sm font-medium text-neutral-900">
                        {dep.title}
                      </div>
                      <div className="text-xs text-neutral-600 mt-0.5">
                        {dep.time} · {dep.guestsBooked}/{dep.guestsCap} guests
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {dep.resourceUse.SM && (
                          <ResourceChip
                            label="SM"
                            used={dep.resourceUse.SM.used}
                            cap={dep.resourceUse.SM.cap}
                          />
                        )}
                        {dep.resourceUse["E-bike"] && (
                          <ResourceChip
                            label="E-bike"
                            used={dep.resourceUse["E-bike"].used}
                            cap={dep.resourceUse["E-bike"].cap}
                          />
                        )}
                        {dep.resourceUse.Guides && (
                          <ResourceChip
                            label="Guides"
                            used={dep.resourceUse.Guides.used}
                            cap={dep.resourceUse.Guides.cap}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                  {deps.length === 0 && (
                    <p className="text-sm text-neutral-500">
                      No departures found.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-neutral-200 px-6 py-4">
          <p className="text-xs text-neutral-500">
            Click a departure to open its edit panel and resolve the conflict.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main AvailabilityClient ──────────────────────────────────────────────────

export default function AvailabilityClient({
  initialDepartures,
}: {
  initialDepartures: DbDeparture[];
}) {
  const [allDepartures, setAllDepartures] =
    React.useState<DbDeparture[]>(initialDepartures);
  const [view, setView] = React.useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = React.useState<Date>(
    new Date(2025, 0, 6),
  );

  const year = currentDate.getFullYear();
  const monthIndex0 = currentDate.getMonth();

  // Modals
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingDeparture, setEditingDeparture] =
    React.useState<UiDeparture | null>(null);
  const [showConflictDrill, setShowConflictDrill] = React.useState(false);

  // Build calendar grid
  const monthGrid = generateMonthGrid(year, monthIndex0);
  const weekDates = getWeekDates(currentDate);
  const monthTitle = formatMonthTitle(year, monthIndex0);

  function getDayData(date: string, inMonth: boolean): DayData {
    const deps = allDepartures
      .filter((d) => d.departure_date === date)
      .map(toUiDeparture)
      .sort((a, b) => a.time.localeCompare(b.time));
    const conflicts = computeConflicts(deps);
    return {
      date,
      dayNumber: new Date(date + "T00:00:00").getDate(),
      departures: deps,
      inMonth,
      conflicts,
    };
  }

  const calendarDays: DayData[] = monthGrid.map((cell) =>
    getDayData(formatISO(cell.date), cell.inMonth),
  );

  // Selected date
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    const first = calendarDays.find((d) => d.departures.length > 0);
    return first?.date ?? calendarDays[0]?.date ?? "";
  });

  // Update selected date when navigating
  React.useEffect(() => {
    if (view === "month") {
      const newDays = generateMonthGrid(
        currentDate.getFullYear(),
        currentDate.getMonth(),
      ).map((cell) => getDayData(formatISO(cell.date), cell.inMonth));
      const first = newDays.find((d) => d.departures.length > 0);
      if (first) setSelectedDate(first.date);
    } else {
      const dates = getWeekDates(currentDate);
      setSelectedDate(dates[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentDate.getTime()]);

  const selectedDayData =
    view === "month"
      ? (calendarDays.find((d) => d.date === selectedDate) ??
        getDayData(selectedDate, true))
      : getDayData(selectedDate, true);

  const selectedStatus = selectedDayData.departures.length
    ? aggregateStatus(selectedDayData.departures)
    : "ok";
  const totalDepartures = selectedDayData.departures.length;
  const totalGuests = selectedDayData.departures.reduce(
    (s, d) => s + d.guestsBooked,
    0,
  );
  const conflicts = selectedDayData.conflicts;

  // Aggregate resource totals for day panel
  const dayTotals = {
    SM: selectedDayData.departures.reduce(
      (s, d) => s + (d.resourceUse.SM?.used ?? 0),
      0,
    ),
    "E-bike": selectedDayData.departures.reduce(
      (s, d) => s + (d.resourceUse["E-bike"]?.used ?? 0),
      0,
    ),
  };

  // Handlers
  function handleDepartureAdded(dep: DbDeparture) {
    setAllDepartures((prev) => [...prev, dep]);
    setSelectedDate(dep.departure_date);
    setShowAddModal(false);
  }

  function handleDepartureSaved(dep: DbDeparture) {
    setAllDepartures((prev) => prev.map((d) => (d.id === dep.id ? dep : d)));
    setEditingDeparture(null);
  }

  function handleDepartureDeleted(id: string) {
    setAllDepartures((prev) => prev.filter((d) => d.id !== id));
    setEditingDeparture(null);
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                Availability
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                {view === "month"
                  ? "Month view with daily operational signals. Click a day to review departures and resource issues."
                  : "Week view with daily departures. Click a day to see details."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("month")}
                className={cx(
                  "rounded-lg border px-3 py-2 text-sm",
                  view === "month"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white hover:bg-neutral-50",
                )}
              >
                Month
              </button>
              <button
                onClick={() => setView("week")}
                className={cx(
                  "rounded-lg border px-3 py-2 text-sm",
                  view === "week"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white hover:bg-neutral-50",
                )}
              >
                Week
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
            {/* Calendar / Week View */}
            <div className="rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const d = new Date(currentDate);
                      if (view === "month") d.setMonth(monthIndex0 - 1);
                      else d.setDate(d.getDate() - 7);
                      setCurrentDate(d);
                    }}
                    className="h-9 w-9 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <div className="text-base font-medium text-neutral-900">
                    {monthTitle}
                  </div>
                  <button
                    onClick={() => {
                      const d = new Date(currentDate);
                      if (view === "month") d.setMonth(monthIndex0 + 1);
                      else d.setDate(d.getDate() + 7);
                      setCurrentDate(d);
                    }}
                    className="h-9 w-9 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
                <div className="text-xs text-neutral-500">
                  {view === "month" ? "4 weeks view" : "Week view"}
                </div>
              </div>

              {view === "month" ? (
                <>
                  <div className="grid grid-cols-7 border-b border-neutral-200 text-xs text-neutral-500">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (w) => (
                        <div key={w} className="px-3 py-2">
                          {w}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => (
                      <div
                        key={day.date}
                        className={cx(
                          "border-b border-r border-neutral-200",
                          idx % 7 === 6 && "border-r-0",
                          idx >= calendarDays.length - 7 && "border-b-0",
                        )}
                      >
                        <DayCell
                          day={day}
                          selected={day.date === selectedDate}
                          onSelect={(d) => setSelectedDate(d.date)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-4">
                  <WeekView
                    weekDates={weekDates}
                    allDepartures={allDepartures}
                    selectedDate={selectedDate}
                    onSelectDay={setSelectedDate}
                    onDepartureClick={setEditingDeparture}
                  />
                </div>
              )}
            </div>

            {/* Selected day panel */}
            <aside className="rounded-xl border border-neutral-200 bg-white">
              <div className="border-b border-neutral-200 px-5 py-4">
                <div className="text-sm font-medium text-neutral-900">
                  Selected day
                </div>
                <div className="mt-1 text-sm text-neutral-600">
                  {selectedDate}
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-700">
                    <span className="font-medium">{totalDepartures}</span>{" "}
                    departures <span className="text-neutral-400">•</span>{" "}
                    <span className="font-medium">{totalGuests}</span> guests
                  </div>
                  <StatusPill status={selectedStatus} />
                </div>

                {/* Conflict warning (SEE-16) */}
                {conflicts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowConflictDrill(true)}
                    className="mt-4 w-full text-left rounded-lg border-2 border-red-300 bg-red-50 p-4 hover:bg-red-100 transition"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-600 font-bold">⚠️</span>
                      <div className="text-sm font-semibold text-red-900">
                        Resource Conflicts
                      </div>
                      <span className="ml-auto text-xs text-red-600 underline">
                        View details →
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {conflicts.map((c, i) => (
                        <li key={i} className="text-sm text-red-800">
                          • {c}
                        </li>
                      ))}
                    </ul>
                  </button>
                )}

                {/* Resource summary */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {dayTotals.SM > 0 ? (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3">
                      <div className="text-xs text-neutral-500">
                        Snowmobiles
                      </div>
                      <div
                        className={cx(
                          "mt-1 text-sm font-medium",
                          dayTotals.SM > CAPACITY.snowmobiles
                            ? "text-red-700"
                            : "text-neutral-900",
                        )}
                      >
                        {dayTotals.SM}/{CAPACITY.snowmobiles}
                      </div>
                    </div>
                  ) : null}
                  {dayTotals["E-bike"] > 0 ? (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3">
                      <div className="text-xs text-neutral-500">E-bikes</div>
                      <div
                        className={cx(
                          "mt-1 text-sm font-medium",
                          dayTotals["E-bike"] > CAPACITY.ebikes
                            ? "text-red-700"
                            : "text-neutral-900",
                        )}
                      >
                        {dayTotals["E-bike"]}/{CAPACITY.ebikes}
                      </div>
                    </div>
                  ) : null}
                  {dayTotals.SM === 0 && dayTotals["E-bike"] === 0 && (
                    <div className="col-span-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center text-xs text-neutral-500">
                      No resources used
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm font-medium text-neutral-900">
                    Departures
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-sm text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-3 space-y-3 max-h-[500px] overflow-y-auto">
                  {selectedDayData.departures.length ? (
                    selectedDayData.departures.map((d) => (
                      <DepartureRow
                        key={d.id}
                        d={d}
                        onClick={setEditingDeparture}
                      />
                    ))
                  ) : (
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                      No departures for this day.
                    </div>
                  )}
                </div>

                {conflicts.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowConflictDrill(true)}
                      className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                    >
                      Review Issues
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Add Departure Modal */}
      {showAddModal && (
        <AddDepartureModal
          prefilledDate={selectedDate}
          onClose={() => setShowAddModal(false)}
          onSaved={handleDepartureAdded}
        />
      )}

      {/* Departure Slide-Over */}
      {editingDeparture && (
        <DepartureSlideOver
          departure={editingDeparture}
          onClose={() => setEditingDeparture(null)}
          onSaved={handleDepartureSaved}
          onDeleted={handleDepartureDeleted}
        />
      )}

      {/* Conflict Drill-Down */}
      {showConflictDrill && (
        <ConflictDrillDown
          conflicts={conflicts}
          dayDepartures={selectedDayData.departures}
          onClose={() => setShowConflictDrill(false)}
          onDepartureClick={(dep) => {
            setShowConflictDrill(false);
            setEditingDeparture(dep);
          }}
        />
      )}
    </>
  );
}
