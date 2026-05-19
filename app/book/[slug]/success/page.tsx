import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

const BG = "#F4F1EA";
const DARK = "#0A0A0A";
const MUTED = "#6B6760";
const BORDER = `1.5px solid ${DARK}`;
const ACCENT = "#FF5A36";
const CARD_BG = "#FFFFFF";

function fmtEUR(n: number) {
  return "€" + n.toFixed(2);
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

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 18px",
        borderBottom: last ? "none" : "1px solid #E8E6E0",
        gap: 16,
        flexWrap: "wrap" as const,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 10,
          color: MUTED,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontWeight: 600,
          fontSize: 14,
          textAlign: "right" as const,
        }}
      >
        {value}
      </span>
    </div>
  );
}

type SearchParams = { booking_id?: string; ref?: string };

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  if (!sp.booking_id) redirect(`/book/${slug}`);

  const admin = createAdminClient();
  const { data: booking } = await admin
    .schema(SCHEMA)
    .from("bookings")
    .select("*")
    .eq("id", sp.booking_id)
    .single();

  if (!booking) redirect(`/book/${slug}`);

  const reference = sp.ref ?? "SE-" + sp.booking_id.slice(-6).toUpperCase();
  const isPaid = booking.total_price > 0;
  const customerFirstName =
    booking.customer_name?.split(" ")[0] ?? "adventurer";

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        fontFamily: "var(--font-space-grotesk), sans-serif",
      }}
    >
      <div
        style={{ padding: "60px 24px 120px", maxWidth: 720, margin: "0 auto" }}
      >
        {/* Check mark */}
        <div
          style={{
            width: 88,
            height: 88,
            border: `3px solid ${DARK}`,
            background: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 700,
            fontSize: 44,
            marginBottom: 28,
            color: DARK,
          }}
        >
          ✓
        </div>

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
          Booking {isPaid ? "confirmed" : "requested"}
        </div>

        <h1
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 700,
            fontSize: "clamp(32px, 6vw, 52px)",
            lineHeight: 1.0,
            letterSpacing: "-0.025em",
            margin: "0 0 20px",
          }}
        >
          You&apos;re on the list, {customerFirstName}.
        </h1>

        <p
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 17,
            lineHeight: 1.5,
            color: "#3A3833",
            margin: "0 0 28px",
            maxWidth: 540,
          }}
        >
          {isPaid
            ? `Your booking has been confirmed. We've sent a confirmation to ${booking.customer_email}.`
            : `Your request has been sent to the provider. They'll confirm by email within 24h.`}
        </p>

        {/* Details card */}
        <div style={{ border: BORDER, background: CARD_BG, marginBottom: 24 }}>
          <DetailRow label="Reference" value={reference} />
          <DetailRow label="Activity" value={booking.product_name} />
          {booking.booking_date && (
            <DetailRow label="Date" value={fmtDateLong(booking.booking_date)} />
          )}
          {booking.booking_time && (
            <DetailRow label="Time" value={booking.booking_time} />
          )}
          <DetailRow
            label="Travelers"
            value={`${booking.guests} ${booking.guests === 1 ? "person" : "people"}`}
          />
          <DetailRow label="Confirmation to" value={booking.customer_email} />
          {isPaid && (
            <DetailRow
              label="Total charged"
              value={fmtEUR(Number(booking.total_price))}
              last
            />
          )}
        </div>

        <div
          style={{
            marginBottom: 28,
            padding: "16px 18px",
            background: BG,
            border: "1.5px dashed #0A0A0A",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13,
            color: "#3A3833",
            lineHeight: 1.5,
          }}
        >
          <strong>What&apos;s next?</strong> Watch your inbox for the
          confirmation.
          {isPaid
            ? " If anything changes, the provider will contact you directly."
            : " If the provider declines, you won't be charged."}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
          <Link
            href={`/book/${slug}`}
            style={{
              background: "transparent",
              border: BORDER,
              padding: "14px 18px",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              color: DARK,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Book another
          </Link>
        </div>
      </div>
    </div>
  );
}
