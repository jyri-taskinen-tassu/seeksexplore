import { redirect } from "next/navigation";
import Stripe from "stripe";
import Link from "next/link";

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

type SearchParams = { session_id?: string; booking_id?: string; ref?: string };

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  // ── Free booking (no Stripe) ────────────────────────────────────────────────
  if (sp.booking_id && sp.ref) {
    return (
      <SuccessScreen
        slug={slug}
        reference={sp.ref}
        productName="Your experience"
        slotDate={null}
        slotTime={null}
        guests={null}
        customerName={null}
        customerEmail={null}
        totalAmount={null}
        isPaid={false}
      />
    );
  }

  // ── Stripe checkout ─────────────────────────────────────────────────────────
  if (!sp.session_id) redirect(`/book/${slug}`);

  if (!process.env.STRIPE_SECRET_KEY) redirect(`/book/${slug}`);

  let session: Stripe.Checkout.Session;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    session = await stripe.checkout.sessions.retrieve(sp.session_id);
  } catch {
    redirect(`/book/${slug}`);
  }

  if (session.status !== "complete") redirect(`/book/${slug}`);

  const meta = session.metadata ?? {};
  const reference = "SE-" + sp.session_id.slice(-6).toUpperCase();

  return (
    <SuccessScreen
      slug={slug}
      reference={reference}
      productName={meta.product_name ?? "Your experience"}
      slotDate={meta.slot_date ?? null}
      slotTime={meta.slot_time ?? null}
      guests={meta.guests ? parseInt(meta.guests, 10) : null}
      customerName={meta.customer_name ?? null}
      customerEmail={meta.customer_email ?? session.customer_email ?? null}
      totalAmount={
        session.amount_total != null ? session.amount_total / 100 : null
      }
      isPaid
    />
  );
}

function SuccessScreen({
  slug,
  reference,
  productName,
  slotDate,
  slotTime,
  guests,
  customerName,
  customerEmail,
  totalAmount,
  isPaid,
}: {
  slug: string;
  reference: string;
  productName: string;
  slotDate: string | null;
  slotTime: string | null;
  guests: number | null;
  customerName: string | null;
  customerEmail: string | null;
  totalAmount: number | null;
  isPaid: boolean;
}) {
  const firstName = customerName?.split(" ")[0] ?? "adventurer";

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
          You&apos;re on the list, {firstName}.
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
            ? `Your booking has been confirmed. We've sent a confirmation to ${customerEmail ?? "your email"}.`
            : `Your request has been sent to the provider. They'll confirm by email within 24h.`}
        </p>

        {/* Details card */}
        <div style={{ border: BORDER, background: CARD_BG, marginBottom: 24 }}>
          <DetailRow label="Reference" value={reference} />
          <DetailRow label="Activity" value={productName} />
          {slotDate && <DetailRow label="Date" value={fmtDateLong(slotDate)} />}
          {slotTime && <DetailRow label="Time" value={slotTime} />}
          {guests != null && (
            <DetailRow
              label="Travelers"
              value={`${guests} ${guests === 1 ? "person" : "people"}`}
            />
          )}
          {customerEmail && (
            <DetailRow label="Confirmation to" value={customerEmail} />
          )}
          {totalAmount != null && (
            <DetailRow label="Total charged" value={fmtEUR(totalAmount)} last />
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
