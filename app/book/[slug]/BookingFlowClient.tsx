"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProductData = {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  price_from: number | null;
  pricing_unit: string | null;
  duration_hours: number | null;
  duration_minutes: number | null;
  duration_days: number | null;
  capacity_max: number | null;
  city: string | null;
  available_months: string[] | null;
  cover_image: string | null;
  tags: string[];
};

type SlotData = { time: string; available: boolean; spotsLeft: number };
type DayData = { date: string; inSeason: boolean; slots: SlotData[] };
type SelectedSlot = { date: string; time: string; spotsLeft: number };

type Form = {
  people: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const ACCENT = "#FF5A36";
const BG = "#F4F1EA";
const DARK = "#0A0A0A";
const MUTED = "#6B6760";
const CARD_BG = "#FFFFFF";
const BORDER = `1.5px solid ${DARK}`;

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtEUR(n: number) {
  return "€" + n.toFixed(0);
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function fmtDateLong(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtMonthYear(d: Date) {
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDuration(product: ProductData): string {
  const parts = [];
  if (product.duration_days) parts.push(`${product.duration_days}d`);
  if (product.duration_hours) parts.push(`${product.duration_hours}h`);
  if (product.duration_minutes) parts.push(`${product.duration_minutes}m`);
  return parts.join(" ") || "";
}

function getNextAvailableMonth(months: string[] | null): string {
  if (!months || months.length === 0) return "";
  const today = new Date();
  for (let i = 1; i <= 400; i++) {
    const d = addDays(today, i);
    const name = MONTH_NAMES[d.getMonth()];
    if (months.includes(name)) {
      return fmtMonthYear(d);
    }
  }
  return "";
}

function isAvailableNow(months: string[] | null): boolean {
  if (!months || months.length === 0) return true;
  const currentMonth = MONTH_NAMES[new Date().getMonth()];
  return months.includes(currentMonth);
}

// ─── Pill ──────────────────────────────────────────────────────────────────────

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        padding: "4px 8px",
        border: `1px solid ${DARK}`,
        borderRadius: 999,
        color: DARK,
      }}
    >
      {children}
    </span>
  );
}

// ─── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  const labels = ["Choose activity", "Pick a slot", "Details & payment"];
  return (
    <div
      style={{
        padding: "18px 24px 22px",
        borderBottom: BORDER,
        background: BG,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            color: MUTED,
          }}
        >
          Step {Math.min(step + 1, 3)} / 3
        </div>
        <div
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: DARK,
          }}
        >
          {labels[Math.min(step, 2)]}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {labels.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              background: i < step ? DARK : i === step ? ACCENT : "transparent",
              border: BORDER,
              transition: "background 200ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Sticky Footer ─────────────────────────────────────────────────────────────

function StickyFooter({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: BG,
        borderTop: BORDER,
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap" as const,
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 220ms cubic-bezier(.4,0,.2,1)",
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
}

// ─── Step 0: Product Grid ──────────────────────────────────────────────────────

function StepProduct({
  products,
  providerName,
  selected,
  onSelect,
  onNext,
}: {
  products: ProductData[];
  providerName: string;
  selected: ProductData | null;
  onSelect: (p: ProductData) => void;
  onNext: () => void;
}) {
  const bookableProducts = products.filter(
    (p) => p.type === "experience" || p.capacity_max != null,
  );

  return (
    <div
      style={{
        padding: "28px 24px 120px",
        maxWidth: 1280,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <header
        style={{
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap" as const,
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: MUTED,
              marginBottom: 8,
            }}
          >
            01 · Choose your activity
          </div>
          <h1
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 5vw, 44px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Pick something that gets your pulse up.
          </h1>
          <div
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 14,
              color: MUTED,
              marginTop: 8,
            }}
          >
            Experiences by{" "}
            <strong style={{ color: DARK }}>{providerName}</strong>
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            color: MUTED,
          }}
        >
          {bookableProducts.length} experiences available
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {bookableProducts.map((p) => {
          const isSelected = selected?.id === p.id;
          const availNow = isAvailableNow(p.available_months);
          const nextMonth = !availNow
            ? getNextAvailableMonth(p.available_months)
            : null;

          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              style={{
                display: "flex",
                flexDirection: "column" as const,
                textAlign: "left" as const,
                background: CARD_BG,
                border: BORDER,
                padding: 0,
                cursor: "pointer",
                outline: isSelected ? `3px solid ${ACCENT}` : "none",
                outlineOffset: isSelected ? "-3px" : "0",
                transform: isSelected ? "translateY(-2px)" : "none",
                transition: "transform 150ms ease",
              }}
            >
              {/* Image */}
              <div
                style={{
                  aspectRatio: "4 / 3",
                  borderBottom: BORDER,
                  position: "relative",
                  background: "#E8E6E0",
                  overflow: "hidden",
                }}
              >
                {p.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.cover_image}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#C8C4BB",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 14,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase" as const,
                        color: DARK,
                        opacity: 0.6,
                      }}
                    >
                      {p.type ?? "experience"}
                    </span>
                  </div>
                )}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: ACCENT,
                      border: BORDER,
                      padding: "4px 10px",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    Selected
                  </div>
                )}
                {nextMonth && (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: BG,
                      border: BORDER,
                      padding: "4px 10px",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase" as const,
                      color: MUTED,
                    }}
                  >
                    From {nextMonth}
                  </div>
                )}
              </div>

              {/* Body */}
              <div
                style={{
                  padding: "16px 18px 18px",
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 12,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      lineHeight: 1.15,
                      letterSpacing: "-0.01em",
                      margin: 0,
                    }}
                  >
                    {p.name}
                  </h3>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 16,
                      fontWeight: 600,
                      whiteSpace: "nowrap" as const,
                      flexShrink: 0,
                    }}
                  >
                    {p.price_from != null ? `€${p.price_from}` : "On request"}
                  </div>
                </div>

                {p.description && (
                  <p
                    style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 13,
                      lineHeight: 1.45,
                      color: "#3A3833",
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden",
                    }}
                  >
                    {p.description}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap" as const,
                    gap: 6,
                    marginTop: "auto",
                  }}
                >
                  {formatDuration(p) && <Pill>{formatDuration(p)}</Pill>}
                  {p.capacity_max && <Pill>≤ {p.capacity_max} ppl</Pill>}
                  {p.pricing_unit && <Pill>/ {p.pricing_unit}</Pill>}
                </div>

                {p.city && (
                  <div
                    style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 12,
                      color: MUTED,
                      paddingTop: 10,
                      borderTop: "1px dashed #0A0A0A",
                    }}
                  >
                    📍 {p.city}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <StickyFooter visible={!!selected}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {selected && (
            <>
              {selected.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.cover_image}
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    border: BORDER,
                    flexShrink: 0,
                  }}
                />
              )}
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {selected.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    color: MUTED,
                  }}
                >
                  {selected.price_from != null
                    ? `€${selected.price_from} / person`
                    : "Price on request"}
                  {formatDuration(selected) && ` · ${formatDuration(selected)}`}
                </div>
              </div>
            </>
          )}
        </div>
        <button
          onClick={onNext}
          disabled={!selected}
          style={{
            background: selected ? DARK : "#CFCBC2",
            color: selected ? BG : MUTED,
            border: BORDER,
            padding: "14px 22px",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: selected ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          Continue
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 16,
            }}
          >
            →
          </span>
        </button>
      </StickyFooter>
    </div>
  );
}

// ─── Step 1: Availability Calendar ────────────────────────────────────────────

function StepAvailability({
  slug,
  product,
  slot,
  onSelectSlot,
  onNext,
  onBack,
}: {
  slug: string;
  product: ProductData;
  slot: SelectedSlot | null;
  onSelectSlot: (s: SelectedSlot | null) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [days, setDays] = useState<DayData[] | null>(null);
  const [nextAvailableDate, setNextAvailableDate] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchSlots = useCallback(
    async (ws: Date) => {
      setLoading(true);
      const from = formatISO(ws);
      const to = formatISO(addDays(ws, 6));
      try {
        const res = await fetch(
          `/api/book/${slug}/availability?product_id=${product.id}&from=${from}&to=${to}`,
        );
        const data = await res.json();
        setDays(data.days ?? []);
        setNextAvailableDate(data.nextAvailableDate ?? null);
      } finally {
        setLoading(false);
      }
    },
    [slug, product.id],
  );

  useEffect(() => {
    fetchSlots(weekStart);
  }, [weekStart, fetchSlots]);

  const shiftWeek = (delta: number) => {
    setWeekStart((prev) => addDays(prev, delta * 7));
    onSelectSlot(null);
  };

  const jumpToNextAvailable = () => {
    if (nextAvailableDate) {
      setWeekStart(getMonday(new Date(nextAvailableDate + "T00:00:00")));
      onSelectSlot(null);
    }
  };

  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${weekStart.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${weekEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
  const todayStr = formatISO(new Date());
  const noAvailabilityThisWeek = days != null && days.every((d) => !d.inSeason);

  return (
    <div
      style={{
        padding: "28px 24px 120px",
        maxWidth: 1280,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <header
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap" as const,
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: MUTED,
              marginBottom: 8,
            }}
          >
            02 · Pick a slot
          </div>
          <h1
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontWeight: 700,
              fontSize: "clamp(26px, 4.5vw, 40px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            When are you free?
          </h1>
          {formatDuration(product) && (
            <div
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 14,
                color: "#3A3833",
                marginTop: 8,
              }}
            >
              {formatDuration(product)} per session
            </div>
          )}
        </div>
      </header>

      {/* Product summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 14px",
          border: BORDER,
          background: CARD_BG,
          marginBottom: 20,
          flexWrap: "wrap" as const,
        }}
      >
        {product.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.cover_image}
            alt=""
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              border: BORDER,
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              background: "#C8C4BB",
              border: BORDER,
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {product.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              color: MUTED,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              marginTop: 2,
            }}
          >
            {product.price_from != null
              ? `€${product.price_from} / person`
              : "Price on request"}
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            background: "transparent",
            border: BORDER,
            padding: "8px 12px",
            cursor: "pointer",
            color: DARK,
          }}
        >
          Change
        </button>
      </div>

      {/* No availability banner */}
      {!loading && noAvailabilityThisWeek && (
        <div
          style={{
            padding: "14px 18px",
            background: CARD_BG,
            border: BORDER,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap" as const,
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 14,
              color: DARK,
            }}
          >
            No departures this week.
            {nextAvailableDate && (
              <span style={{ color: MUTED }}>
                {" "}
                Next available:{" "}
                <strong style={{ color: DARK }}>
                  {fmtDateLong(nextAvailableDate)}
                </strong>
              </span>
            )}
          </div>
          {nextAvailableDate && (
            <button
              onClick={jumpToNextAvailable}
              style={{
                background: DARK,
                color: BG,
                border: BORDER,
                padding: "8px 16px",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Jump to next available →
            </button>
          )}
        </div>
      )}

      {/* Week nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap" as const,
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          {weekLabel}
        </div>
        <div style={{ display: "flex" }}>
          <button onClick={() => shiftWeek(-1)} style={navBtn}>
            ← Prev week
          </button>
          <button
            onClick={() => shiftWeek(1)}
            style={{ ...navBtn, borderLeft: "none" }}
          >
            Next week →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 10,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          color: MUTED,
          flexWrap: "wrap" as const,
        }}
      >
        <LegendDot color={CARD_BG} border={BORDER} label="Available" />
        <LegendDot
          color="#E8E6E0"
          border={`1.5px solid #CFCBC2`}
          label="Unavailable"
        />
        <LegendDot color={ACCENT} border={BORDER} label="Selected" />
      </div>

      {/* Calendar grid */}
      <div
        ref={scrollRef}
        style={{
          border: BORDER,
          background: CARD_BG,
          overflow: "auto",
          position: "relative",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(244,241,234,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                color: MUTED,
              }}
            >
              Loading…
            </span>
          </div>
        )}
        <div style={{ minWidth: 720 }}>
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "64px repeat(7, 1fr)",
              borderBottom: BORDER,
              position: "sticky",
              top: 0,
              background: CARD_BG,
              zIndex: 2,
            }}
          >
            <div style={{ borderRight: BORDER }} />
            {(
              days ??
              Array.from({ length: 7 }, (_, i) => ({
                date: formatISO(addDays(weekStart, i)),
                inSeason: false,
                slots: [],
              }))
            ).map((day, i) => {
              const isToday = day.date === todayStr;
              return (
                <div
                  key={i}
                  style={{
                    padding: "10px 8px",
                    textAlign: "center" as const,
                    borderRight: i < 6 ? "1px solid #E8E6E0" : "none",
                    background: isToday ? DARK : "transparent",
                    color: isToday ? BG : DARK,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase" as const,
                      opacity: 0.7,
                    }}
                  >
                    {new Date(day.date + "T00:00:00").toLocaleDateString(
                      "en-GB",
                      { weekday: "short" },
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      lineHeight: 1.1,
                      marginTop: 2,
                    }}
                  >
                    {new Date(day.date + "T00:00:00").getDate()}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 9,
                      opacity: 0.6,
                      marginTop: 2,
                    }}
                  >
                    {new Date(day.date + "T00:00:00").toLocaleDateString(
                      "en-GB",
                      { month: "short" },
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          {TIME_SLOTS.map((time, ti) => (
            <div
              key={time}
              style={{
                display: "grid",
                gridTemplateColumns: "64px repeat(7, 1fr)",
                borderBottom:
                  ti < TIME_SLOTS.length - 1 ? "1px solid #E8E6E0" : "none",
              }}
            >
              <div
                style={{
                  padding: "6px 8px",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  color: MUTED,
                  borderRight: BORDER,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-end",
                }}
              >
                {time}
              </div>
              {(
                days ??
                Array.from({ length: 7 }, () => ({
                  date: "",
                  inSeason: false,
                  slots: [],
                }))
              ).map((day, di) => {
                const s = day.slots[ti] ?? { available: false, spotsLeft: 0 };
                const isSelected =
                  slot?.date === day.date && slot?.time === time;
                return (
                  <button
                    key={di}
                    onClick={() =>
                      s.available &&
                      onSelectSlot({
                        date: day.date,
                        time,
                        spotsLeft: s.spotsLeft,
                      })
                    }
                    disabled={!s.available}
                    style={{
                      border: "none",
                      borderRight: di < 6 ? "1px solid #E8E6E0" : "none",
                      background: isSelected
                        ? ACCENT
                        : s.available
                          ? CARD_BG
                          : "repeating-linear-gradient(45deg,#F4F1EA,#F4F1EA 4px,#E8E6E0 4px,#E8E6E0 8px)",
                      cursor: s.available ? "pointer" : "not-allowed",
                      height: 44,
                      padding: "4px 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background 100ms",
                    }}
                    onMouseEnter={(e) => {
                      if (s.available && !isSelected)
                        e.currentTarget.style.background = BG;
                    }}
                    onMouseLeave={(e) => {
                      if (s.available && !isSelected)
                        e.currentTarget.style.background = CARD_BG;
                    }}
                  >
                    {s.available && (
                      <>
                        <span
                          style={{
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            fontSize: 10,
                            color: DARK,
                            fontWeight: 600,
                          }}
                        >
                          {time}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            fontSize: 9,
                            color: isSelected ? DARK : MUTED,
                          }}
                        >
                          {s.spotsLeft}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <StickyFooter visible>
        <button onClick={onBack} style={secondaryBtn}>
          ← Back
        </button>
        {slot ? (
          <div
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                color: MUTED,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
              }}
            >
              Selected
            </span>
            <strong>
              {fmtDate(slot.date)} · {slot.time}
            </strong>
          </div>
        ) : (
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              color: MUTED,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            Tap any open slot
          </div>
        )}
        <button
          onClick={onNext}
          disabled={!slot}
          style={{
            background: slot ? DARK : "#CFCBC2",
            color: slot ? BG : MUTED,
            border: BORDER,
            padding: "14px 22px",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: slot ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          Continue
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 16,
            }}
          >
            →
          </span>
        </button>
      </StickyFooter>
    </div>
  );
}

function LegendDot({
  color,
  border,
  label,
}: {
  color: string;
  border: string;
  label: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 12,
          height: 12,
          background: color,
          border,
          display: "inline-block",
        }}
      />
      <span>{label}</span>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  background: "transparent",
  border: BORDER,
  padding: "8px 12px",
  cursor: "pointer",
  color: DARK,
};

const secondaryBtn: React.CSSProperties = {
  background: "transparent",
  color: DARK,
  border: BORDER,
  padding: "14px 18px",
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

// ─── Step 2: Details + Payment ─────────────────────────────────────────────────

function StepDetails({
  slug,
  product,
  slot,
  form,
  setForm,
  onBack,
}: {
  slug: string;
  product: ProductData;
  slot: SelectedSlot;
  form: Form;
  setForm: (f: Form) => void;
  onBack: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof Form, v: string | number) =>
    setForm({ ...form, [k]: v });

  const maxPeople = product.capacity_max ?? 20;
  const pricePerPerson = product.price_from;
  const subtotal = pricePerPerson != null ? pricePerPerson * form.people : null;
  const serviceFee =
    subtotal != null ? Math.round(subtotal * 0.04 * 100) / 100 : null;
  const total =
    subtotal != null && serviceFee != null ? subtotal + serviceFee : null;

  const canSubmit =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.people >= 1;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/book/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          slot_date: slot.date,
          slot_time: slot.time,
          guests: form.people,
          price_per_person: pricePerPerson,
          customer_first_name: form.firstName.trim(),
          customer_last_name: form.lastName.trim(),
          customer_email: form.email.trim(),
          customer_phone: form.phone.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      if (data.url) {
        // Stripe checkout
        window.location.href = data.url;
      } else if (data.booking_id) {
        // Free booking (no Stripe)
        window.location.href = `/book/${slug}/success?booking_id=${data.booking_id}&ref=${data.reference}`;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr", width: "100%" }}
      className="step3-grid"
    >
      {/* Form */}
      <div
        style={{
          padding: "28px 24px 140px",
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: MUTED,
            marginBottom: 8,
          }}
        >
          03 · Details &amp; payment
        </div>
        <h1
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 700,
            fontSize: "clamp(26px, 4.5vw, 40px)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            margin: "0 0 28px",
          }}
        >
          Just a few details and we&apos;ll hold your spot.
        </h1>

        {/* Group size */}
        <FormSection
          title="01 · Group size"
          hint={`How many people are coming? Max ${maxPeople}.`}
        >
          <Counter
            value={form.people}
            onChange={(v) => update("people", v)}
            min={1}
            max={maxPeople}
          />
          {pricePerPerson != null && (
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                color: MUTED,
                marginTop: 8,
              }}
            >
              Max {maxPeople} per booking · €{pricePerPerson} per person
            </div>
          )}
        </FormSection>

        {/* Contact */}
        <FormSection title="02 · Contact" hint="So the provider can reach you">
          <FormRow>
            <FormField label="First name *">
              <input
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                style={inputStyle}
                placeholder="Alex"
              />
            </FormField>
            <FormField label="Last name *">
              <input
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                style={inputStyle}
                placeholder="Petrova"
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Email *">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                style={inputStyle}
                placeholder="alex@example.com"
              />
            </FormField>
            <FormField label="Phone">
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                style={inputStyle}
                placeholder="+358 40 000 0000"
              />
            </FormField>
          </FormRow>
        </FormSection>

        {/* Notes */}
        <FormSection
          title="03 · Anything we should know?"
          hint="Allergies, accessibility needs, special requests"
          optional
        >
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            placeholder="Optional"
            style={{
              ...inputStyle,
              resize: "vertical" as const,
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          />
        </FormSection>

        {/* Payment info */}
        <FormSection
          title="04 · Payment"
          hint={
            pricePerPerson != null
              ? "You'll be redirected to Stripe's secure checkout to complete payment."
              : "No payment required — the provider will confirm your request."
          }
        >
          <div
            style={{
              padding: "14px 16px",
              border: BORDER,
              background: CARD_BG,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13,
              color: "#3A3833",
            }}
          >
            {pricePerPerson != null ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    background: "#1F8A5B",
                    borderRadius: 999,
                  }}
                />
                <span>
                  Secured · Stripe · 256-bit TLS · Charged after provider
                  confirms
                </span>
              </div>
            ) : (
              <div>
                This is a free booking request. The provider will confirm your
                reservation.
              </div>
            )}
          </div>
        </FormSection>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "#FFF0ED",
              border: "1.5px solid #C8442E",
              color: "#C8442E",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Summary sidebar */}
      <aside style={{ background: BG, borderTop: BORDER }}>
        <div style={{ padding: "24px", position: "sticky", top: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              color: MUTED,
              marginBottom: 16,
            }}
          >
            Order summary
          </div>

          {/* Product */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 18,
              paddingBottom: 18,
              borderBottom: BORDER,
            }}
          >
            {product.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.cover_image}
                alt=""
                style={{
                  width: 64,
                  height: 64,
                  objectFit: "cover",
                  border: BORDER,
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "#C8C4BB",
                  border: BORDER,
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1.2,
                }}
              >
                {product.name}
              </div>
            </div>
          </div>

          {/* When */}
          <div
            style={{ padding: "14px 0", borderBottom: "1px dashed #0A0A0A" }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                color: MUTED,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                marginBottom: 4,
              }}
            >
              When
            </div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {fmtDateLong(slot.date)}
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                color: MUTED,
                marginTop: 2,
              }}
            >
              {slot.time}
              {formatDuration(product) && ` · ${formatDuration(product)}`}
            </div>
          </div>

          {/* Travelers */}
          <div
            style={{ padding: "14px 0", borderBottom: "1px dashed #0A0A0A" }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                color: MUTED,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                marginBottom: 4,
              }}
            >
              Travelers
            </div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {form.people}{" "}
              {pricePerPerson != null ? `× €${pricePerPerson}` : "person(s)"}
            </div>
          </div>

          {/* Totals */}
          {subtotal != null && (
            <div style={{ padding: "16px 0", borderBottom: BORDER }}>
              <LineItem label="Subtotal" value={fmtEUR(subtotal)} />
              <LineItem
                label="Service fee (4%)"
                value={fmtEUR(serviceFee!)}
                muted
              />
            </div>
          )}

          {total != null && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "16px 0",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                }}
              >
                Total
              </div>
              <div
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontWeight: 700,
                  fontSize: 32,
                  letterSpacing: "-0.02em",
                }}
              >
                {fmtEUR(total)}
              </div>
            </div>
          )}

          <div
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 12,
              color: "#3A3833",
              lineHeight: 1.5,
              marginBottom: 18,
              padding: "12px 14px",
              background: BG,
              border: "1.5px dashed #0A0A0A",
            }}
          >
            {pricePerPerson != null ? (
              <>
                <strong>Authorization only.</strong> Nothing is charged until
                the provider confirms — usually within 24h.
              </>
            ) : (
              <>
                <strong>Free booking.</strong> The provider will confirm your
                request by email.
              </>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            style={{
              width: "100%",
              background: canSubmit && !submitting ? DARK : "#CFCBC2",
              color: canSubmit && !submitting ? BG : MUTED,
              border: BORDER,
              padding: "18px 22px",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontWeight: 700,
              fontSize: 15,
              cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {submitting
              ? "Redirecting…"
              : pricePerPerson != null
                ? `Pay ${total != null ? fmtEUR(total) : ""} →`
                : "Confirm booking →"}
          </button>

          <button
            onClick={onBack}
            style={{
              width: "100%",
              marginTop: 8,
              background: "transparent",
              border: "none",
              padding: 10,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontWeight: 500,
              fontSize: 13,
              cursor: "pointer",
              color: MUTED,
              textDecoration: "underline",
            }}
          >
            ← Back to slot
          </button>
        </div>
      </aside>

      <style>{`
        @media (min-width: 1024px) {
          .step3-grid { grid-template-columns: 1fr 420px !important; align-items: start !important; }
          .step3-grid aside { border-top: none !important; border-left: ${BORDER} !important; min-height: 100vh; }
        }
      `}</style>
    </div>
  );
}

function FormSection({
  title,
  hint,
  optional,
  children,
}: {
  title: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 28, paddingTop: 20, borderTop: BORDER }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
          gap: 12,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          {title}
        </h3>
        {optional && (
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 10,
              color: MUTED,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            Optional
          </span>
        )}
      </div>
      {hint && (
        <div
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13,
            color: MUTED,
            marginBottom: 14,
            marginTop: -8,
          }}
        >
          {hint}
        </div>
      )}
      {children}
    </section>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 10,
          color: MUTED,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: CARD_BG,
  border: BORDER,
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: DARK,
  outline: "none",
  boxSizing: "border-box",
  borderRadius: 0,
};

function Counter({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div
      style={{ display: "inline-flex", border: BORDER, alignItems: "stretch" }}
    >
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        style={counterBtn}
      >
        −
      </button>
      <div
        style={{
          minWidth: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontWeight: 700,
          fontSize: 22,
          borderLeft: BORDER,
          borderRight: BORDER,
        }}
      >
        {value}
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={counterBtn}
      >
        +
      </button>
    </div>
  );
}

const counterBtn: React.CSSProperties = {
  width: 48,
  height: 48,
  background: CARD_BG,
  border: "none",
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontSize: 22,
  fontWeight: 600,
  cursor: "pointer",
  color: DARK,
};

function LineItem({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 0",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 13,
          color: muted ? MUTED : DARK,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 14,
          fontWeight: 600,
          color: muted ? MUTED : DARK,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BookingFlowClient({
  slug,
  providerName,
  products,
}: {
  slug: string;
  providerName: string;
  products: ProductData[];
}) {
  const [step, setStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [form, setForm] = useState<Form>({
    people: 2,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const goTo = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Stepper step={step} />

      {step === 0 && (
        <StepProduct
          products={products}
          providerName={providerName}
          selected={selectedProduct}
          onSelect={setSelectedProduct}
          onNext={() => goTo(1)}
        />
      )}

      {step === 1 && selectedProduct && (
        <StepAvailability
          slug={slug}
          product={selectedProduct}
          slot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          onNext={() => goTo(2)}
          onBack={() => goTo(0)}
        />
      )}

      {step === 2 && selectedProduct && selectedSlot && (
        <StepDetails
          slug={slug}
          product={selectedProduct}
          slot={selectedSlot}
          form={form}
          setForm={setForm}
          onBack={() => goTo(1)}
        />
      )}
    </div>
  );
}
