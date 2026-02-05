"use client";

// app/provider/availability/page.tsx
import React from "react";
import {
  getDeparturesByDate,
  getWeekDates,
  getDaySummary,
  type MockDeparture,
  type AggregatedResources,
  checkResourceConflicts,
  getEndTimeWithBuffer,
} from "./_mockData";

type Status = "ok" | "attention" | "problem";

type Departure = {
  id: string;
  title: string;
  time: string; // "10:00"
  guestsBooked: number;
  guestsCap: number;
  status: Status;
  resourceUse: {
    SM?: { used: number; cap: number };
    "E-bike"?: { used: number; cap: number };
    Guides?: { used: number; cap: number };
  };
  notes?: string;
  hasEbikes?: boolean; // For buffer visualization
};

type DayData = {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  departures: Departure[];
  inMonth?: boolean;
  summary?: {
    departuresCount: number;
    guestsBooked: number;
    guestsCapacity: number;
    resources: AggregatedResources;
    conflicts: string[];
  };
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function StatusPill({ status }: { status: Status }) {
  const map = {
    ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    attention: "bg-amber-50 text-amber-700 ring-amber-200",
    problem: "bg-red-50 text-red-700 ring-red-200",
  } as const;

  const label = status === "ok" ? "OK" : status === "attention" ? "Attention" : "Problem";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1",
        map[status]
      )}
    >
      <span
        className={cx(
          "h-2 w-2 rounded-full",
          status === "ok" && "bg-emerald-500",
          status === "attention" && "bg-amber-500",
          status === "problem" && "bg-red-500"
        )}
      />
      {label}
    </span>
  );
}

function ResourceChip({ label, used, cap }: { label: string; used: number; cap: number }) {
  const near = used >= cap;
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-lg px-3 py-1 text-xs ring-1",
        near ? "bg-red-50 text-red-700 ring-red-200" : "bg-neutral-50 text-neutral-700 ring-neutral-200"
      )}
      title={`${label} ${used}/${cap}`}
    >
      {label} {used}/{cap}
    </span>
  );
}

/**
 * Convert MockDeparture to UI Departure format
 */
function convertDeparture(mock: MockDeparture): Departure {
  // Calculate status based on conflicts and fill rate
  let status: Status = "ok";
  const fillRate = mock.guestsBooked / mock.guestsCapacity;

  if (mock.notes?.toLowerCase().includes("conflict") || mock.notes?.toLowerCase().includes("exceeds")) {
    status = "problem";
  } else if (fillRate < 0.3 || mock.notes?.toLowerCase().includes("low fill")) {
    status = "attention";
  } else if (fillRate >= 0.9 || mock.notes?.toLowerCase().includes("near cap")) {
    status = "attention";
  }

  // Aggregate resources for display
  const resourceUse: Departure["resourceUse"] = {};
  let hasEbikes = false;

  if (mock.resources.snowmobiles) {
    const totalSM = Object.values(mock.resources.snowmobiles).reduce((sum, n) => sum + (n || 0), 0);
    if (totalSM > 0) {
      resourceUse.SM = { used: totalSM, cap: 28 }; // Total inventory
    }
  }

  if (mock.resources.ebikes) {
    hasEbikes = true;
    const totalEbikes = Object.values(mock.resources.ebikes).reduce((sum, n) => sum + (n || 0), 0);
    if (totalEbikes > 0) {
      resourceUse["E-bike"] = { used: totalEbikes, cap: 20 }; // Total inventory
    }
  }

  if (mock.resources.guides) {
    resourceUse.Guides = { used: mock.resources.guides, cap: 12 };
  }

  return {
    id: mock.id,
    title: mock.title,
    time: mock.startTime,
    guestsBooked: mock.guestsBooked,
    guestsCap: mock.guestsCapacity,
    status,
    resourceUse,
    notes: mock.notes,
    hasEbikes,
  };
}

/**
 * Aggregate day-level status from departures
 */
function aggregateStatus(departures: Departure[]): Status {
  if (departures.some((d) => d.status === "problem")) return "problem";
  if (departures.some((d) => d.status === "attention")) return "attention";
  return "ok";
}

/**
 * Get simplified resource totals for day cell display
 */
function getDayCellResources(summary: AggregatedResources): { SM?: number; "E-bike"?: number } {
  const smTotal = Object.values(summary.snowmobiles).reduce((sum, d) => sum + (d?.used || 0), 0);
  const ebikeTotal = Object.values(summary.ebikes).reduce((sum, d) => sum + (d?.used || 0), 0);

  return {
    ...(smTotal > 0 && { SM: smTotal }),
    ...(ebikeTotal > 0 && { "E-bike": ebikeTotal }),
  };
}

function formatISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatMonthTitle(year: number, monthIndex0: number): string {
  const d = new Date(year, monthIndex0, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Generate calendar grid for a month (28 cells = 4 weeks)
 */
function generateMonthGrid(year: number, monthIndex0: number): Array<{ date: Date; dayNumber: number; inMonth: boolean }> {
  const first = new Date(year, monthIndex0, 1);
  const startDow = (first.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const startDate = new Date(year, monthIndex0, 1 - startDow);

  const grid: Array<{ date: Date; dayNumber: number; inMonth: boolean }> = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const inMonth = d.getMonth() === monthIndex0;
    grid.push({ date: d, dayNumber: d.getDate(), inMonth });
  }
  return grid;
}

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
  const inMonth = day.inMonth !== false;

  const totalDepartures = day.departures.length;
  const totalGuests = day.departures.reduce((sum, d) => sum + d.guestsBooked, 0);

  // Get resource totals from summary if available, otherwise calculate
  const resources = day.summary
    ? getDayCellResources(day.summary.resources)
    : hasDepartures
      ? {
          SM: day.departures.reduce((sum, d) => sum + (d.resourceUse.SM?.used || 0), 0) || undefined,
          "E-bike": day.departures.reduce((sum, d) => sum + (d.resourceUse["E-bike"]?.used || 0), 0) || undefined,
        }
      : {};

  // Show first 2 departures, then "+x more" if there are more
  const MAX_VISIBLE = 2;
  const visibleDepartures = day.departures.slice(0, MAX_VISIBLE);
  const hiddenCount = Math.max(0, totalDepartures - MAX_VISIBLE);

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cx(
        "relative w-full text-left p-3 min-h-[140px] border border-neutral-200 transition",
        inMonth ? "bg-white hover:bg-neutral-50" : "bg-neutral-50 text-neutral-400",
        selected && "ring-2 ring-neutral-900"
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cx("text-sm font-medium", selected ? "text-neutral-900" : inMonth ? "text-neutral-800" : "text-neutral-400")}>
          {day.dayNumber}
        </div>
        {hasDepartures && inMonth ? <StatusPill status={status} /> : null}
      </div>

      {hasDepartures && inMonth ? (
        <div className="mt-2 space-y-2">
          <div className="text-sm text-neutral-700">
            <span className="font-medium">{totalDepartures}</span> departures <span className="text-neutral-400">•</span>{" "}
            <span className="font-medium">{totalGuests}</span> guests
          </div>

          <div className="space-y-1">
            {visibleDepartures.map((dep) => (
              <div key={dep.id} className="text-xs text-neutral-600">
                <span className="font-medium text-neutral-900">{dep.time}</span> {dep.title}
              </div>
            ))}
            {hiddenCount > 0 ? (
              <div className="text-xs text-neutral-500">+{hiddenCount} more</div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {resources.SM && (
              <ResourceChip label="SM" used={resources.SM} cap={28} />
            )}
            {resources["E-bike"] && (
              <ResourceChip label="E-bike" used={resources["E-bike"]} cap={20} />
            )}
          </div>
        </div>
      ) : inMonth ? (
        <div className="mt-6 text-xs text-neutral-400">No departures</div>
      ) : null}
    </button>
  );
}

function DepartureRow({ d }: { d: Departure }) {
  const conflicts = d.notes && (d.notes.toLowerCase().includes("conflict") || d.notes.toLowerCase().includes("exceeds"));

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cx(
                "h-2.5 w-2.5 rounded-full",
                d.status === "ok" && "bg-emerald-500",
                d.status === "attention" && "bg-amber-500",
                d.status === "problem" && "bg-red-500"
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
          {d.notes ? (
            <div className={cx("mt-2 text-sm", conflicts ? "text-red-600 font-medium" : "text-neutral-500")}>
              {d.notes}
            </div>
          ) : null}
        </div>

        <span
          className={cx(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium ring-1",
            d.status === "ok" && "bg-emerald-50 text-emerald-700 ring-emerald-200",
            d.status === "attention" && "bg-amber-50 text-amber-700 ring-amber-200",
            d.status === "problem" && "bg-red-50 text-red-700 ring-red-200"
          )}
        >
          {d.status === "ok" ? "OK" : d.status === "attention" ? "Attention" : "Problem"}
        </span>
      </div>

      {/* Compact resources line */}
      <div className="mt-3 flex flex-wrap gap-2">
        {d.resourceUse.SM && (
          <ResourceChip label="SM" used={d.resourceUse.SM.used} cap={d.resourceUse.SM.cap} />
        )}
        {d.resourceUse["E-bike"] && (
          <ResourceChip label="E-bike" used={d.resourceUse["E-bike"].used} cap={d.resourceUse["E-bike"].cap} />
        )}
        {d.resourceUse.Guides && (
          <ResourceChip label="Guides" used={d.resourceUse.Guides.used} cap={d.resourceUse.Guides.cap} />
        )}
      </div>
    </div>
  );
}

/**
 * Week view component
 */
function WeekView({ weekDates, selectedDate, onSelectDay }: { weekDates: string[]; selectedDate: string; onSelectDay: (date: string) => void }) {
  const weekDays: DayData[] = weekDates.map((date, idx) => {
    const d = new Date(date);
    const mockDepartures = getDeparturesByDate(date);
    const departures = mockDepartures.map(convertDeparture);
    const summary = getDaySummary(date);

    return {
      date,
      dayNumber: d.getDate(),
      departures,
      inMonth: true,
      summary,
    };
  });

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day, idx) => (
        <div key={day.date} className="border border-neutral-200 rounded-lg bg-white">
          <div
            className={cx(
              "border-b border-neutral-200 px-3 py-2 text-sm font-medium",
              day.date === selectedDate && "bg-neutral-900 text-white"
            )}
          >
            <div>{dayNames[idx]}</div>
            <div className="text-xs font-normal">{day.dayNumber}</div>
          </div>
          <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {day.departures.length === 0 ? (
              <div className="text-xs text-neutral-400 text-center py-4">No departures</div>
            ) : (
              day.departures.map((dep) => (
                <button
                  key={dep.id}
                  onClick={() => onSelectDay(day.date)}
                  className="w-full text-left p-2 rounded border border-neutral-200 hover:bg-neutral-50 transition"
                >
                  <div className="text-xs font-medium text-neutral-900">{dep.time}</div>
                  <div className="text-xs text-neutral-600 mt-0.5">{dep.title}</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {dep.guestsBooked}/{dep.guestsCap} guests
                  </div>
                  {dep.hasEbikes && (
                    <div className="text-[10px] text-neutral-400 mt-1">+3h buffer</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProviderAvailabilityPage() {
  // View state: "month" or "week"
  const [view, setView] = React.useState<"month" | "week">("month");

  // Current month state - start with a date that has data (2025-01-06 is Monday with data)
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date(2025, 0, 6)); // January 6, 2025 (Monday with data)
  const year = currentDate.getFullYear();
  const monthIndex0 = currentDate.getMonth();

  // Generate month grid
  const monthGrid = generateMonthGrid(year, monthIndex0);
  const calendarDays: DayData[] = monthGrid.map((cell) => {
    const iso = formatISO(cell.date);
    const mockDepartures = getDeparturesByDate(iso);
    const departures = mockDepartures.map(convertDeparture);
    const summary = getDaySummary(iso);

    return {
      date: iso,
      dayNumber: cell.dayNumber,
      departures,
      inMonth: cell.inMonth,
      summary,
    };
  });

  // Generate week dates
  const weekDates = getWeekDates(currentDate);

  const days = view === "month" ? calendarDays : [];
  const monthTitle = formatMonthTitle(year, monthIndex0);

  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    // Initial state calculation
    if (view === "month") {
      const firstWithData = calendarDays.find((d) => d.departures.length > 0);
      return firstWithData?.date ?? calendarDays[0]?.date ?? "";
    } else {
      const weekDatesInit = getWeekDates(currentDate);
      for (const date of weekDatesInit) {
        const mockDepartures = getDeparturesByDate(date);
        if (mockDepartures.length > 0) {
          return date;
        }
      }
      return weekDatesInit[0] ?? "";
    }
  });

  // Update selected date when view or week changes
  React.useEffect(() => {
    let newDate: string;
    if (view === "month") {
      newDate = days.find((d) => d.departures.length > 0)?.date ?? days[0]?.date ?? "";
    } else {
      // For week view, find first date with data
      newDate = weekDates[0] ?? "";
      for (const date of weekDates) {
        const mockDepartures = getDeparturesByDate(date);
        if (mockDepartures.length > 0) {
          newDate = date;
          break;
        }
      }
    }
    if (newDate && newDate !== selectedDate) {
      setSelectedDate(newDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentDate.getTime()]);

  // Get selected day data
  const selectedDayData = view === "month"
    ? days.find((d) => d.date === selectedDate)
    : (() => {
        const mockDepartures = getDeparturesByDate(selectedDate);
        const departures = mockDepartures.map(convertDeparture);
        const summary = getDaySummary(selectedDate);
        return {
          date: selectedDate,
          dayNumber: new Date(selectedDate).getDate(),
          departures,
          inMonth: true,
          summary,
        };
      })();

  const selectedDay = selectedDayData ?? { date: "", dayNumber: 0, departures: [], summary: undefined };

  const selectedStatus = selectedDay.departures.length ? aggregateStatus(selectedDay.departures) : "ok";
  const totalDepartures = selectedDay.departures.length;
  const totalGuests = selectedDay.departures.reduce((sum, d) => sum + d.guestsBooked, 0);

  // Get resource summary from day summary
  const resourcesAgg = selectedDay.summary
    ? getDayCellResources(selectedDay.summary.resources)
    : {};

  const conflicts = selectedDay.summary?.conflicts ?? [];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Availability</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {view === "month" ? "Month view with daily operational signals. Click a day to review departures and resource issues." : "Week view with daily departures. Click a day to see details."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("month")}
              className={cx(
                "rounded-lg border px-3 py-2 text-sm",
                view === "month"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white hover:bg-neutral-50"
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
                  : "border-neutral-200 bg-white hover:bg-neutral-50"
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
                    const newDate = new Date(currentDate);
                    if (view === "month") {
                      newDate.setMonth(monthIndex0 - 1);
                    } else {
                      newDate.setDate(newDate.getDate() - 7);
                    }
                    setCurrentDate(newDate);
                  }}
                  className="h-9 w-9 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <div className="text-base font-medium text-neutral-900">{monthTitle}</div>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (view === "month") {
                      newDate.setMonth(monthIndex0 + 1);
                    } else {
                      newDate.setDate(newDate.getDate() + 7);
                    }
                    setCurrentDate(newDate);
                  }}
                  className="h-9 w-9 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                  aria-label="Next"
                >
                  ›
                </button>
              </div>
              <div className="text-xs text-neutral-500">{view === "month" ? "4 weeks view" : "Week view"}</div>
            </div>

            {view === "month" ? (
              <>
                {/* Weekday header */}
                <div className="grid grid-cols-7 border-b border-neutral-200 text-xs text-neutral-500">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
                    <div key={w} className="px-3 py-2">
                      {w}
                    </div>
                  ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7">
                  {days.map((day, idx) => {
                    const isLastInRow = idx % 7 === 6;
                    const isLastRow = idx >= days.length - 7;
                    return (
                      <div
                        key={day.date}
                        className={cx(
                          "border-b border-r border-neutral-200",
                          isLastInRow && "border-r-0",
                          isLastRow && "border-b-0"
                        )}
                      >
                        <DayCell day={day} selected={day.date === selectedDate} onSelect={(d) => setSelectedDate(d.date)} />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-4">
                <WeekView weekDates={weekDates} selectedDate={selectedDate} onSelectDay={setSelectedDate} />
              </div>
            )}
          </div>

          {/* Selected day */}
          <aside className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-5 py-4">
              <div className="text-sm font-medium text-neutral-900">Selected day</div>
              <div className="mt-1 text-sm text-neutral-600">{selectedDay?.date}</div>
            </div>

            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-700">
                  <span className="font-medium">{totalDepartures}</span> departures{" "}
                  <span className="text-neutral-400">•</span> <span className="font-medium">{totalGuests}</span> guests
                </div>
                <StatusPill status={selectedStatus} />
              </div>

              {/* Conflicts warning */}
              {conflicts.length > 0 && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="text-xs font-medium text-red-900">Resource conflicts:</div>
                  <ul className="mt-1 space-y-1">
                    {conflicts.map((c, idx) => (
                      <li key={idx} className="text-xs text-red-700">• {c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resource summary */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {resourcesAgg.SM && (
                  <div className="rounded-lg border border-neutral-200 bg-white p-3">
                    <div className="text-xs text-neutral-500">Snowmobiles</div>
                    <div className="mt-1 text-sm font-medium text-neutral-900">
                      {resourcesAgg.SM}/28
                    </div>
                  </div>
                )}
                {resourcesAgg["E-bike"] && (
                  <div className="rounded-lg border border-neutral-200 bg-white p-3">
                    <div className="text-xs text-neutral-500">E-bikes</div>
                    <div className="mt-1 text-sm font-medium text-neutral-900">
                      {resourcesAgg["E-bike"]}/20
                    </div>
                  </div>
                )}
                {!resourcesAgg.SM && !resourcesAgg["E-bike"] && (
                  <div className="col-span-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center text-xs text-neutral-500">
                    No resources used
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm font-medium text-neutral-900">Departures</div>
                <button className="text-sm text-neutral-900 underline underline-offset-4 hover:text-neutral-700">
                  Add
                </button>
              </div>

              <div className="mt-3 space-y-3 max-h-[500px] overflow-y-auto">
                {selectedDay.departures.length ? (
                  selectedDay.departures.map((d) => <DepartureRow key={d.id} d={d} />)
                ) : (
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                    No departures for this day.
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50">
                  Close day
                </button>
                <button className="flex-1 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800">
                  Review issues
                </button>
              </div>

              <div className="mt-4 text-xs text-neutral-500">
                MVP note: editing departures can be a slide-over next (keep month view fast).
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
