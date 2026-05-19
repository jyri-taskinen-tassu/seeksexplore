"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";

type Language = "en" | "fi";

const translations = {
  en: {
    nav: {
      features: "Features",
      howItWorks: "How it works",
      embed: "Embed",
      contact: "Contact",
    },
    hero: {
      badge: "Operational · 312 providers live",
      words: ["Run", "your", "experiences,", "not", "the", "paperwork."],
      italicWord: "paperwork.",
      subhead:
        "The operations OS for activity providers — manage departures, resources and bookings in one place, then drop our embed widget on your site so guests book direct.",
      ctaPrimary: "Start a free trial",
      ctaSecondary: "Watch the 90s overview",
    },
    features: {
      eyebrow: "Features",
      title: "Everything you need",
      titleEm: "to run the day",
      titleEnd: ", nothing you don't.",
      subtitle:
        "Built with providers, not for them. Each piece earns its place — every screen exists because an operator asked for it on a Tuesday morning at 7am.",
      cards: [
        {
          tag: "01",
          title: "Operational overview",
          body: "See every departure, guide and resource at a single glance. Today, tomorrow, next week — without switching tools.",
          stat: "14 guests · 3 departures",
        },
        {
          tag: "02",
          title: "Resource awareness",
          body: "Track snowmobiles, e-bikes, guides and equipment. Know what is in maintenance and what is overbookable before it becomes a fire.",
          stat: "32 / 28 snowmobiles used",
        },
        {
          tag: "03",
          title: "Booking clarity",
          body: "Real-time guest counts, allocations and potential conflicts surface automatically — every morning, before coffee.",
          stat: "€3,210 booked this week",
        },
        {
          tag: "04",
          title: "Embed & sell direct",
          body: "Drop our booking widget on your existing site. Stop fielding phone reservations — let guests confirm & pay themselves.",
          stat: '<script src="embed.js"/>',
          mono: true,
        },
      ],
    },
    dashboard: {
      eyebrow: "The Provider Dashboard",
      title: "One screen, every moving part —",
      titleEm: "before it stops moving",
      subtitle:
        "Catch overbookings, low-fill alerts and customer messages while you're still on your first coffee.",
    },
    howItWorks: {
      eyebrow: "How it works",
      title: "Up and running in",
      titleEm: "three days",
      titleEnd: ", not three months.",
      steps: [
        {
          n: "01",
          tag: "Day 1",
          title: "Add your products",
          body: "AI-assisted setup pulls your existing experiences in from Visit Finland, your old PDF brochure, or whatever spreadsheet you survive on today.",
        },
        {
          n: "02",
          tag: "Day 2",
          title: "Set resource rules",
          body: "Configure vehicles, equipment and guide availability once. The system handles allocation automatically — no more colour-coded calendars.",
        },
        {
          n: "03",
          tag: "Day 3",
          title: "Embed & go live",
          body: 'Paste one line into your website. Customers book direct. You stop answering 40 calls a day asking "is Tuesday still open?".',
        },
      ],
    },
    embed: {
      eyebrow: "Embed widget",
      title: "Drop one line. Stop answering booking calls.",
      titleEm: "That's it.",
      subtitle:
        "Your existing website keeps its design. Customers see availability, pick a slot and pay — all without picking up the phone.",
      bullets: [
        "Real-time availability from your dashboard",
        "Multi-currency, multi-language out of the box",
        "Stripe / Klarna / invoice — your terms",
        "Mobile-first, accessible, no cookies",
      ],
    },
    whoFor: {
      eyebrow: "Who it's for",
      title: "Built with Finnish providers,",
      titleEm: "first.",
      closing:
        '"Whether the experience is in the forest or indoors — the goal is the same: fewer moving parts, smoother days, more sales."',
      audiences: [
        {
          title: "Experience & activity providers",
          body: "Outdoor and indoor experiences — from forest adventures to distillery tours.",
        },
        {
          title: "Tours, tastings & distillery visits",
          body: "Manage scheduled departures, capacity and guest bookings seamlessly.",
        },
        {
          title: "Guided activities & classes",
          body: "Track schedules, instructor availability and participant bookings.",
        },
        {
          title: "Small teams that need clarity",
          body: "Without constant manual work — see what is happening at a glance.",
        },
      ],
    },
    cta: {
      eyebrow: "Ready when you are",
      line1: "Smoother days",
      line2: "start Monday.",
      subtitle:
        "Free 30-day trial. No credit card. We'll help you import your products and get the embed live before lunch.",
      ctaPrimary: "Start free trial",
      ctaSecondary: "Book a 20min demo",
      stats: [
        { v: "312", l: "Active providers" },
        { v: "€2.4M", l: "Booked through embed" },
        { v: "3d", l: "Avg. time to go live" },
        { v: "4.9/5", l: "Provider rating" },
      ],
    },
    contact: {
      eyebrow: "Get in touch",
      title: "Talk to us about",
      titleEm: "your operations",
      titleEnd: ".",
      subtitle:
        "We reply within 48 hours — usually faster. Tell us about your experiences and what's slowing you down.",
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      submit: "Send message",
      sending: "Sending...",
      success: "Message sent successfully! We'll get back to you soon.",
      error: "Failed to send message. Please try again.",
      privacyConsent: "I agree to the",
      privacyLink: "privacy policy",
    },
    footer: {
      copyright: "© 2026 Seeks & Explore. All rights reserved.",
    },
  },
  fi: {
    nav: {
      features: "Ominaisuudet",
      howItWorks: "Miten se toimii",
      embed: "Upotus",
      contact: "Ota yhteyttä",
    },
    hero: {
      badge: "Toiminnassa · 312 palveluntarjoajaa",
      words: ["Hoida", "elämyksiäsi,", "älä", "paperikasoasi."],
      italicWord: "paperikasoasi.",
      subhead:
        "Aktiviteetti- ja elämyspalveluiden hallintajärjestelmä — hallitse lähtöjä, resursseja ja varauksia yhdessä paikassa, ja lisää upotuswidget sivustolle niin vieraat voivat varata suoraan.",
      ctaPrimary: "Aloita ilmainen kokeilu",
      ctaSecondary: "Katso 90s yleiskatsaus",
    },
    features: {
      eyebrow: "Ominaisuudet",
      title: "Kaikki mitä tarvitset",
      titleEm: "päivän pyörittämiseen",
      titleEnd: ", ei mitään turhaa.",
      subtitle:
        "Rakennettu yhdessä palveluntarjoajien kanssa, ei vain heitä varten. Jokainen osa on ansainnut paikkansa — jokainen näyttö on olemassa koska joku pyysi sitä tiistaiaamuisin klo 7.",
      cards: [
        {
          tag: "01",
          title: "Operatiivinen yleiskuva",
          body: "Näe kaikki lähdöt, oppaat ja resurssit yhdellä silmäyksellä. Tänään, huomenna, ensi viikolla — ilman järjestelmien välillä siirtymistä.",
          stat: "14 vierasta · 3 lähtöä",
        },
        {
          tag: "02",
          title: "Resurssinäkymä",
          body: "Seuraa moottorikelkkoja, sähköpyöriä, oppaita ja välineitä. Tiedä mitä on huollossa ja mikä on ylivarattavissa ennen kuin siitä tulee ongelma.",
          stat: "32 / 28 moottorikelkkaa käytössä",
        },
        {
          tag: "03",
          title: "Varauksien selkeys",
          body: "Reaaliaikaiset vierasmäärät, allokoinnit ja mahdolliset konfliktit nousevat automaattisesti esiin — joka aamu ennen kahvia.",
          stat: "€3 210 varattu tällä viikolla",
        },
        {
          tag: "04",
          title: "Upotus & suoramyynti",
          body: "Lisää varauswidget olemassa olevalle sivustollesi. Lopeta puhelinvarausten käsittely — anna vieraiden vahvistaa ja maksaa itse.",
          stat: '<script src="embed.js"/>',
          mono: true,
        },
      ],
    },
    dashboard: {
      eyebrow: "Palveluntarjoajan hallintapaneeli",
      title: "Yksi näyttö, kaikki liikkuvat osat —",
      titleEm: "ennen kuin ne pysähtyvät",
      subtitle:
        "Huomaa ylivaraukset, matalan täyttöasteen hälytykset ja asiakasviestit jo ensimmäisen kahvin aikana.",
    },
    howItWorks: {
      eyebrow: "Miten se toimii",
      title: "Toiminnassa",
      titleEm: "kolmessa päivässä",
      titleEnd: ", ei kolmessa kuukaudessa.",
      steps: [
        {
          n: "01",
          tag: "Päivä 1",
          title: "Lisää tuotteet",
          body: "Tekoälyavusteinen asennus tuo olemassa olevat palvelusi Visit Finlandista, vanhasta PDF-esitteestä tai mistä tahansa taulukkolaskennasta.",
        },
        {
          n: "02",
          tag: "Päivä 2",
          title: "Aseta resurssisäännöt",
          body: "Määritä ajoneuvot, välineet ja oppaiden saatavuus kerran. Järjestelmä hoitaa allokoinnin automaattisesti — ei enää värillisiä kalentereita.",
        },
        {
          n: "03",
          tag: "Päivä 3",
          title: "Upota ja siirry livenä",
          body: "Liitä yksi rivi verkkosivustollesi. Asiakkaat varaavat suoraan. Lopetat 40 puhelun vastaamisen päivässä.",
        },
      ],
    },
    embed: {
      eyebrow: "Upotuswidget",
      title: "Lisää yksi rivi. Lopeta varaussoittoihin vastaaminen.",
      titleEm: "Siinä kaikki.",
      subtitle:
        "Olemassa oleva verkkosivustosi säilyttää ulkoasunsa. Asiakkaat näkevät saatavuuden, valitsevat ajan ja maksavat — ilman puhelimeen tarttumista.",
      bullets: [
        "Reaaliaikainen saatavuus hallintapaneelistasi",
        "Useita valuuttoja ja kieliä valmiina",
        "Stripe / Klarna / lasku — sinun ehdoillasi",
        "Mobile-first, saavutettava, ei evästeitä",
      ],
    },
    whoFor: {
      eyebrow: "Kenelle se on",
      title: "Rakennettu suomalaisten palveluntarjoajien kanssa,",
      titleEm: "ensin.",
      closing:
        '"Tapahtuuko elämys metsässä vai sisätiloissa — tavoite on sama: vähemmän liikkuvia osia, sujuvammat päivät, enemmän myyntiä."',
      audiences: [
        {
          title: "Elämys- ja aktiviteettitarjoajat",
          body: "Ulko- ja sisätilaelämykset — metsäseikkailuista panimokierroksille.",
        },
        {
          title: "Kierrokset, maistelut ja panimovierailut",
          body: "Hallitse ajoitettuja lähtöjä, kapasiteettia ja vierasvarauksia saumattomasti.",
        },
        {
          title: "Ohjatut aktiviteetit ja luokat",
          body: "Pidä kirjaa aikatauluista, ohjaajien saatavuudesta ja osallistujavarauksista.",
        },
        {
          title: "Pienet tiimit, jotka tarvitsevat selkeyttä",
          body: "Ilman jatkuvaa manuaalista työtä — näe mitä tapahtuu yhdellä silmäyksellä.",
        },
      ],
    },
    cta: {
      eyebrow: "Valmis kun sinä olet",
      line1: "Sujuvammat päivät",
      line2: "alkavat maanantaina.",
      subtitle:
        "30 päivän ilmainen kokeilu. Ei luottokorttia. Autamme tuomaan tuotteet ja saamaan upotusvideran livenä ennen lounasta.",
      ctaPrimary: "Aloita ilmainen kokeilu",
      ctaSecondary: "Varaa 20 min demo",
      stats: [
        { v: "312", l: "Aktiivista palveluntarjoajaa" },
        { v: "€2,4M", l: "Varattu upotusten kautta" },
        { v: "3 pv", l: "Käynnistysaika keskimäärin" },
        { v: "4,9/5", l: "Palveluntarjoajan arvio" },
      ],
    },
    contact: {
      eyebrow: "Ota yhteyttä",
      title: "Kerro meille",
      titleEm: "operaatioistasi",
      titleEnd: ".",
      subtitle:
        "Vastaamme 48 tunnin sisällä — yleensä nopeammin. Kerro elämyksistäsi ja siitä mikä hidastaa toimintaasi.",
      name: "Nimi",
      email: "Sähköposti",
      phone: "Puhelin",
      message: "Viesti",
      submit: "Lähetä viesti",
      sending: "Lähetetään...",
      success: "Viesti lähetetty onnistuneesti! Otamme yhteyttä pian.",
      error: "Viestin lähetys epäonnistui. Yritä uudelleen.",
      privacyConsent: "Hyväksyn",
      privacyLink: "tietosuojaselosteen",
    },
    footer: {
      copyright: "© 2026 Seeks & Explore. Kaikki oikeudet pidätetään.",
    },
  },
};

// ===== ICONS =====
const Icons = {
  arrow: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  arrowUpRight: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M4 10L10 4M10 4H5M10 4V9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.5 7.5L6 11L11.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  chart: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 17V8m5 9V3m5 14v-6m5 6v-9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  box: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 6l7-3 7 3v8l-7 3-7-3V6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M3 6l7 3 7-3M10 9v9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bookings: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 3h7l4 4v10H5V3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v4h4M8 11h5M8 14h5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  embed: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M7 6l-4 4 4 4M13 6l4 4-4 4M11 4l-2 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  spark: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1v3M7 10v3M1 7h3M10 7h3M3 3l2 2M9 9l2 2M3 11l2-2M9 5l2-2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  play: () => (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "rgba(246, 241, 231, 0.15)",
        border: "1px solid rgba(246, 241, 231, 0.4)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
        <path d="M1 0v8l7-4z" />
      </svg>
    </span>
  ),
};

// ===== LOGO =====
function Logo({ light = false }: { light?: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle
        cx="14"
        cy="14"
        r="13"
        stroke={light ? "rgba(246, 241, 231, 0.7)" : "var(--green-800)"}
        strokeWidth="1.4"
      />
      <path
        d="M8 17c2-4 4-7 6-7s4 3 6 7"
        stroke={light ? "rgba(246, 241, 231, 0.7)" : "var(--green-800)"}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="14" cy="10" r="1.5" fill="var(--terracotta)" />
    </svg>
  );
}

// ===== NAV =====
type NavProps = {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (typeof translations)["en"];
};

function LandingNav({ language, setLanguage, t }: NavProps) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  scrollY.on("change", (y) => setScrolled(y > 40));

  const links = [
    { label: t.nav.features, href: "#features" },
    { label: t.nav.howItWorks, href: "#how" },
    { label: t.nav.embed, href: "#embed" },
    { label: t.nav.contact, href: "#contact" },
  ];

  const navStyle: React.CSSProperties = {
    position: "fixed",
    top: scrolled ? 14 : 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: scrolled ? "min(1100px, calc(100% - 28px))" : "100%",
    maxWidth: "100%",
    zIndex: 100,
    background: scrolled
      ? "rgba(246, 241, 231, 0.85)"
      : "rgba(246, 241, 231, 0)",
    backdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
    WebkitBackdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
    border: scrolled
      ? "1px solid rgba(220, 211, 191, 0.6)"
      : "1px solid transparent",
    borderRadius: scrolled ? 999 : 0,
    transition: "all 320ms cubic-bezier(.2,.8,.2,1)",
    boxShadow: scrolled ? "0 8px 30px rgba(15, 42, 31, 0.06)" : "none",
  };

  return (
    <nav style={navStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "10px 18px 10px 22px" : "18px 32px",
          transition: "padding 320ms cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <a
          href="#top"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <Logo />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              color: "var(--green-900)",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {"Seeks "}
            <span style={{ color: "var(--terracotta)" }}>&amp;</span>
            {" Explore"}
          </span>
        </a>

        <div
          style={{ display: "flex", alignItems: "center", gap: 4 }}
          className="nav-links"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                padding: "8px 14px",
                fontSize: 14,
                color: "var(--ink)",
                fontWeight: 500,
                borderRadius: 999,
                transition: "color 160ms ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--terracotta)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink)")}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              background: "rgba(220, 211, 191, 0.4)",
              borderRadius: 999,
              padding: 3,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
          >
            <button
              onClick={() => setLanguage("en")}
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                background:
                  language === "en" ? "var(--green-800)" : "transparent",
                color: language === "en" ? "var(--cream-50)" : "var(--ink-sub)",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("fi")}
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                background:
                  language === "fi" ? "var(--green-800)" : "transparent",
                color: language === "fi" ? "var(--cream-50)" : "var(--ink-sub)",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            >
              FI
            </button>
          </div>
          <a
            href="/auth/login"
            className="btn btn-secondary"
            style={{ padding: "10px 18px", fontSize: 13 }}
          >
            Log in
          </a>
        </div>
      </div>
    </nav>
  );
}

// ===== HERO =====
function LandingHero({ t }: { t: (typeof translations)["en"] }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.35, 0.7]);

  const mouseX = useMotionValue(0);
  const sx = useSpring(mouseX, { stiffness: 50, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    mouseX.set(x * 20);
  };

  const { words, italicWord } = t.hero;

  return (
    <section
      ref={heroRef}
      id="top"
      onMouseMove={handleMouse}
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 720,
        overflow: "hidden",
        background: "var(--green-900)",
        color: "var(--cream-50)",
      }}
    >
      {/* Background image with parallax */}
      <motion.div
        style={{
          position: "absolute",
          inset: -40,
          y: bgY,
          x: sx,
          scale: bgScale,
          backgroundImage:
            'url("https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=2400&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.75) brightness(0.55)",
        }}
      />

      {/* Overlays */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15, 42, 31, 0.75) 0%, rgba(15, 42, 31, 0.45) 35%, rgba(15, 42, 31, 0.92) 100%)",
          opacity: overlayOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(232, 148, 100, 0.22) 0%, transparent 55%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(15, 42, 31, 0.35) 100%)",
        }}
      />

      {/* Grain texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.08,
          mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
          pointerEvents: "none",
        }}
      />

      {/* Hero content */}
      <motion.div
        style={{
          position: "relative",
          zIndex: 4,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "120px 32px 100px",
          y: contentY,
          opacity: contentOpacity,
        }}
      >
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            background: "rgba(246, 241, 231, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(246, 241, 231, 0.25)",
            borderRadius: 999,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(246, 241, 231, 0.9)",
            marginBottom: 36,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#9DD89A",
              boxShadow: "0 0 10px #9DD89A",
            }}
          />
          {t.hero.badge}
        </motion.div>

        {/* Word-by-word headline */}
        <h1
          className="display"
          style={{
            fontSize: "clamp(48px, 8vw, 112px)",
            color: "var(--cream-50)",
            maxWidth: 1100,
            margin: "0 0 28px",
            fontWeight: 400,
          }}
        >
          {words.map((w, i) => (
            <span key={i}>
              <motion.span
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: 0.15 * i + 0.2,
                  duration: 0.9,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                style={{
                  display: "inline-block",
                  fontStyle: w === italicWord ? "italic" : "normal",
                  color: w === italicWord ? "var(--terracotta)" : "inherit",
                  textShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
                }}
              >
                {w}
              </motion.span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7 }}
          style={{
            fontSize: "clamp(15px, 1.5vw, 19px)",
            lineHeight: 1.55,
            color: "rgba(246, 241, 231, 0.78)",
            maxWidth: 560,
            margin: "0 0 40px",
          }}
        >
          {t.hero.subhead}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.7 }}
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <a
            href="#contact"
            className="btn"
            style={{
              background: "var(--terracotta)",
              color: "var(--green-900)",
              padding: "16px 26px",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {t.hero.ctaPrimary} <Icons.arrow />
          </a>
          <a
            href="#how"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 22px",
              fontSize: 15,
              fontWeight: 500,
              color: "var(--cream-50)",
              borderRadius: 999,
              border: "1px solid rgba(246, 241, 231, 0.3)",
              transition: "background 180ms",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(246, 241, 231, 0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Icons.play /> {t.hero.ctaSecondary}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          color: "rgba(246, 241, 231, 0.6)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.16em",
          zIndex: 4,
        }}
      >
        <span>SCROLL</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 1,
            height: 40,
            background:
              "linear-gradient(to bottom, transparent, rgba(246, 241, 231, 0.7))",
          }}
        />
      </motion.div>
    </section>
  );
}

// ===== MARQUEE =====
function LandingMarquee() {
  const items = [
    "TAHKO ADVENTURE OY",
    "ARCTIC SAUNA CO.",
    "NORDIC FORAGE",
    "LAPLAND HUSKIES",
    "TRAILION GUIDES",
    "AURORA EXPEDITIONS",
    "FOREST & FIRE",
    "WILD KARELIA",
  ];
  const loop = [...items, ...items];

  return (
    <section
      style={{
        padding: "28px 0",
        background: "var(--green-900)",
        color: "rgba(246, 241, 231, 0.7)",
        overflow: "hidden",
        borderTop: "1px solid rgba(246, 241, 231, 0.08)",
        borderBottom: "1px solid rgba(246, 241, 231, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 18,
          justifyContent: "center",
        }}
      >
        <span
          style={{
            height: 1,
            width: 40,
            background: "rgba(246, 241, 231, 0.2)",
          }}
        />
        <span
          className="eyebrow"
          style={{ color: "rgba(246, 241, 231, 0.55)" }}
        >
          Trusted by experience operators across the Nordics
        </span>
        <span
          style={{
            height: 1,
            width: 40,
            background: "rgba(246, 241, 231, 0.2)",
          }}
        />
      </div>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{
            display: "flex",
            gap: 56,
            whiteSpace: "nowrap",
            width: "max-content",
          }}
        >
          {loop.map((item, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                letterSpacing: "0.16em",
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {item}
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--terracotta)",
                  display: "inline-block",
                }}
              />
            </span>
          ))}
        </motion.div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 120,
            background:
              "linear-gradient(to right, var(--green-900), transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: 120,
            background:
              "linear-gradient(to left, var(--green-900), transparent)",
            pointerEvents: "none",
          }}
        />
      </div>
    </section>
  );
}

// ===== FEATURES =====
type FeatureCardData = {
  tag: string;
  title: string;
  body: string;
  stat: string;
  mono?: boolean;
  color: string;
  Icon: () => React.ReactElement;
};

function FeatureCard({ f, idx }: { f: FeatureCardData; idx: number }) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: idx * 0.08,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        padding: 36,
        background: hover ? "var(--green-900)" : "var(--white)",
        color: hover ? "var(--cream-50)" : "var(--ink)",
        borderRadius: 18,
        border: "1px solid var(--line)",
        cursor: "pointer",
        overflow: "hidden",
        transition:
          "background 280ms ease, color 280ms ease, transform 280ms ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        minHeight: 320,
      }}
    >
      {/* Accent corner glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: `radial-gradient(circle at top right, ${f.color}30, transparent 70%)`,
          pointerEvents: "none",
          opacity: hover ? 1 : 0.4,
          transition: "opacity 280ms",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 56,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: hover
              ? "rgba(246, 241, 231, 0.08)"
              : "var(--cream-100)",
            border: `1px solid ${hover ? "rgba(246, 241, 231, 0.18)" : "var(--line)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: hover ? f.color : "var(--ink)",
            transition: "all 280ms",
          }}
        >
          <f.Icon />
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: hover ? "rgba(246, 241, 231, 0.5)" : "var(--ink-sub)",
          }}
        >
          {f.tag}
        </span>
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 30,
          fontWeight: 400,
          letterSpacing: "-0.01em",
          margin: "0 0 14px",
          lineHeight: 1.1,
        }}
      >
        {f.title}
      </h3>

      <p
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: hover ? "rgba(246, 241, 231, 0.7)" : "var(--ink-sub)",
          margin: "0 0 24px",
          maxWidth: 380,
        }}
      >
        {f.body}
      </p>

      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 36,
          right: 36,
          paddingTop: 18,
          borderTop: `1px solid ${hover ? "rgba(246, 241, 231, 0.15)" : "var(--line)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "border-color 280ms",
        }}
      >
        <span
          style={{
            fontFamily: f.mono ? "var(--font-mono)" : "var(--font-sans)",
            fontSize: f.mono ? 12 : 13,
            color: hover ? f.color : "var(--ink-sub)",
            transition: "color 280ms",
          }}
        >
          {f.stat}
        </span>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1px solid ${hover ? "rgba(246, 241, 231, 0.3)" : "var(--line)"}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transform: hover ? "translateX(0)" : "translateX(-4px)",
            opacity: hover ? 1 : 0.6,
            transition: "all 280ms",
          }}
        >
          <Icons.arrowUpRight />
        </span>
      </div>
    </motion.div>
  );
}

function LandingFeatures({ t }: { t: (typeof translations)["en"] }) {
  const iconMap = [Icons.chart, Icons.box, Icons.bookings, Icons.embed];
  const colorMap = [
    "var(--green-800)",
    "var(--terracotta)",
    "var(--green-700)",
    "var(--green-900)",
  ];

  const cards: FeatureCardData[] = t.features.cards.map((c, i) => ({
    ...c,
    color: colorMap[i],
    Icon: iconMap[i],
  }));

  return (
    <section
      id="features"
      style={{
        padding: "160px 0 120px",
        background: "var(--cream-50)",
        position: "relative",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: 80,
            marginBottom: 80,
            alignItems: "end",
          }}
          className="features-header"
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 28 }}>
              {t.features.eyebrow}
            </div>
            <h2
              className="display"
              style={{ fontSize: "clamp(40px, 5vw, 64px)", margin: 0 }}
            >
              {t.features.title} <em>{t.features.titleEm}</em>
              {t.features.titleEnd}
            </h2>
          </div>
          <div style={{ paddingBottom: 8 }}>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--ink-sub)",
                maxWidth: 480,
                margin: 0,
              }}
            >
              {t.features.subtitle}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
          }}
          className="features-grid"
        >
          {cards.map((f, i) => (
            <FeatureCard key={i} f={f} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== DASHBOARD SHOWCASE =====
function DashboardMock() {
  const activities = [
    {
      status: "ok",
      name: "Snowmobile Safari (Sport)",
      time: "10:00–12:30",
      guide: "Maria K.",
      fill: 80,
      count: "8/10",
    },
    {
      status: "attention",
      name: "City Walk (English)",
      time: "12:00–13:30",
      guide: "Jukka T.",
      fill: 17,
      count: "2/12",
    },
    {
      status: "problem",
      name: "E-bike Tour",
      time: "14:00–16:30",
      guide: "Erik N.",
      fill: 100,
      count: "6/6",
    },
    {
      status: "attention",
      name: "Private Sauna Experience",
      time: "On request",
      guide: "—",
      fill: 0,
      count: "0/6",
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: 560 }}>
      {/* Sidebar */}
      <div
        style={{
          width: 200,
          background: "var(--cream-100)",
          borderRight: "1px solid var(--line)",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "var(--green-900)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cream-50)",
              fontFamily: "var(--font-display)",
              fontSize: 18,
            }}
          >
            T
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Trailion</div>
            <div style={{ fontSize: 10, color: "var(--ink-sub)" }}>
              Provider
            </div>
          </div>
        </div>
        {[
          "Dashboard",
          "Products",
          "Availability",
          "Bookings",
          "Customers",
          "Resources",
          "Analytics",
        ].map((nav, i) => (
          <div
            key={nav}
            style={{
              padding: "7px 10px",
              fontSize: 12.5,
              borderRadius: 6,
              background: i === 0 ? "var(--cream-200)" : "transparent",
              fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? "var(--ink)" : "var(--ink-sub)",
            }}
          >
            {nav}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 22, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
              Tahko Adventure Oy
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-sub)" }}>
              Tuesday, 19 May 2026
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span
              style={{
                padding: "4px 8px",
                borderRadius: 999,
                background: "#FFE9D9",
                color: "#B85C24",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              Needs attention
            </span>
            <span
              style={{
                padding: "4px 10px",
                fontSize: 10,
                border: "1px solid var(--line)",
                borderRadius: 6,
              }}
            >
              Booking page
            </span>
            <span
              style={{
                padding: "4px 10px",
                fontSize: 10,
                background: "var(--green-900)",
                color: "var(--cream-50)",
                borderRadius: 6,
              }}
            >
              + Booking
            </span>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {[
            {
              label: "Departures",
              val: "6",
              status: "ok",
              sub: "Fixed time + on request",
            },
            {
              label: "Guests",
              val: "42",
              status: "ok",
              sub: "Across all activities",
            },
            { label: "Products", val: "3", status: "ok", sub: "Active" },
            {
              label: "Equipment",
              val: "32/28",
              status: "problem",
              sub: "Overbook risk",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
              style={{
                padding: 12,
                border: "1px solid var(--line)",
                borderRadius: 10,
                background: "var(--white)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 10, color: "var(--ink-sub)" }}>
                  {s.label}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: s.status === "ok" ? "#DAF0DA" : "#FFD9D9",
                    color: s.status === "ok" ? "#1F6B3A" : "#A33",
                  }}
                >
                  {s.status === "ok" ? "OK" : "Problem"}
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 2 }}>
                {s.val}
              </div>
              <div style={{ fontSize: 10, color: "var(--ink-sub)" }}>
                {s.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activities list */}
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 10,
            background: "var(--white)",
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Today&apos;s activities
            </div>
            <div style={{ display: "flex", gap: 4, fontSize: 10 }}>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: "var(--green-900)",
                  color: "var(--cream-50)",
                }}
              >
                Today
              </span>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 5,
                  color: "var(--ink-sub)",
                }}
              >
                Tomorrow
              </span>
            </div>
          </div>
          {activities.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 6px",
                borderTop: i ? "1px solid var(--line)" : "none",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  padding: "3px 7px",
                  borderRadius: 999,
                  background:
                    a.status === "ok"
                      ? "#DAF0DA"
                      : a.status === "attention"
                        ? "#FFE9D9"
                        : "#FFD9D9",
                  color:
                    a.status === "ok"
                      ? "#1F6B3A"
                      : a.status === "attention"
                        ? "#B85C24"
                        : "#A33",
                  fontWeight: 500,
                }}
              >
                {a.status === "ok"
                  ? "OK"
                  : a.status === "attention"
                    ? "Attention"
                    : "Problem"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>
                  {a.name}
                </div>
                <div style={{ fontSize: 10, color: "var(--ink-sub)" }}>
                  {a.time} · Guide: {a.guide}
                </div>
              </div>
              <div style={{ width: 120, marginRight: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ color: "var(--ink-sub)" }}>{a.count}</span>
                  <span style={{ fontWeight: 500 }}>{a.fill}%</span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: "var(--cream-100)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${a.fill}%` }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.5 + i * 0.1,
                      duration: 1,
                      ease: "easeOut",
                    }}
                    style={{
                      height: "100%",
                      background:
                        a.status === "problem"
                          ? "#A33"
                          : a.status === "attention"
                            ? "#E89464"
                            : "var(--green-800)",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnnotationCard({
  label,
  text,
  color,
  align = "left",
}: {
  label: string;
  text: string;
  color: string;
  align?: "left" | "right";
}) {
  return (
    <div
      style={{
        background: "rgba(246, 241, 231, 0.95)",
        backdropFilter: "blur(10px)",
        color: "var(--ink)",
        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid rgba(246, 241, 231, 0.5)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        minWidth: 200,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          [align === "right" ? "left" : "right"]: "100%",
          width: 40,
          height: 1,
          background: color,
        }}
      />
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          color: color,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{text}</div>
    </div>
  );
}

function LandingDashboard({ t }: { t: (typeof translations)["en"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const dashY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const dashRotate = useTransform(scrollYProgress, [0, 1], [3, -3]);
  const card1Y = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const card2Y = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: "140px 0 160px",
        background: "var(--green-900)",
        color: "var(--cream-50)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          backgroundImage:
            "linear-gradient(rgba(246, 241, 231, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(246, 241, 231, 0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative" }}>
        <div
          style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 80px" }}
        >
          <div
            className="eyebrow"
            style={{
              color: "rgba(246, 241, 231, 0.6)",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            {t.dashboard.eyebrow}
          </div>
          <h2
            className="display"
            style={{
              color: "var(--cream-50)",
              fontSize: "clamp(40px, 5.5vw, 72px)",
              margin: 0,
              marginBottom: 24,
            }}
          >
            {t.dashboard.title} <em>{t.dashboard.titleEm}</em>
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: "rgba(246, 241, 231, 0.7)",
              maxWidth: 580,
              margin: "0 auto",
            }}
          >
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Dashboard mock with parallax */}
        <motion.div
          style={{
            y: dashY,
            rotate: dashRotate,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              background: "var(--cream-50)",
              color: "var(--ink)",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow:
                "0 60px 120px rgba(0,0,0,0.4), 0 0 0 1px rgba(246, 241, 231, 0.1)",
              maxWidth: 1100,
              margin: "0 auto",
            }}
          >
            <DashboardMock />
          </motion.div>
        </motion.div>

        {/* Floating annotation cards */}
        <motion.div
          style={{ position: "absolute", top: "36%", left: -10, y: card1Y }}
          className="float-card"
        >
          <AnnotationCard
            label="Customer messages"
            text="3 unread questions"
            color="var(--terracotta)"
          />
        </motion.div>

        <motion.div
          style={{ position: "absolute", top: "52%", right: -10, y: card2Y }}
          className="float-card"
        >
          <AnnotationCard
            label="Resource alert"
            text="Snowmobiles overbooked"
            color="#E89464"
            align="right"
          />
        </motion.div>
      </div>
    </section>
  );
}

// ===== HOW IT WORKS =====
function HowStep({
  step,
  idx,
}: {
  step: { n: string; tag: string; title: string; body: string };
  idx: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: idx * 0.15,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      style={{ textAlign: "center" }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          margin: "0 auto 32px",
          borderRadius: "50%",
          background: "var(--green-900)",
          color: "var(--cream-50)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontSize: 30,
          boxShadow: "0 12px 30px rgba(15, 42, 31, 0.18)",
          position: "relative",
        }}
      >
        {step.n}
        <span
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "var(--terracotta)",
            color: "var(--green-900)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icons.spark />
        </span>
      </div>

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--ink-sub)",
          textTransform: "uppercase",
        }}
      >
        {step.tag}
      </span>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          fontWeight: 400,
          letterSpacing: "-0.01em",
          margin: "8px 0 14px",
          color: "var(--green-900)",
        }}
      >
        {step.title}
      </h3>

      <p
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: "var(--ink-sub)",
          maxWidth: 320,
          margin: "0 auto",
        }}
      >
        {step.body}
      </p>
    </motion.div>
  );
}

function LandingHowItWorks({ t }: { t: (typeof translations)["en"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineScale = useTransform(scrollYProgress, [0.15, 0.7], [0, 1]);

  return (
    <section
      id="how"
      ref={sectionRef}
      style={{
        padding: "140px 0",
        background: "var(--cream-50)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 100 }}>
          <div
            className="eyebrow"
            style={{ justifyContent: "center", marginBottom: 24 }}
          >
            {t.howItWorks.eyebrow}
          </div>
          <h2
            className="display"
            style={{
              fontSize: "clamp(40px, 5.5vw, 72px)",
              margin: "0 auto",
              maxWidth: 900,
            }}
          >
            {t.howItWorks.title} <em>{t.howItWorks.titleEm}</em>
            {t.howItWorks.titleEnd}
          </h2>
        </div>

        <div style={{ position: "relative" }} className="how-grid-wrap">
          {/* Animated connecting line */}
          <div
            style={{
              position: "absolute",
              top: 38,
              left: "12%",
              right: "12%",
              height: 2,
              background: "var(--line)",
              zIndex: 0,
            }}
            className="how-line"
          >
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--terracotta)",
                transformOrigin: "left center",
                scaleX: lineScale,
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 48,
              position: "relative",
              zIndex: 1,
            }}
            className="how-grid"
          >
            {t.howItWorks.steps.map((s, i) => (
              <HowStep key={i} step={s} idx={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== EMBED SHOWCASE =====
function CodeSnippet() {
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{
        background: "var(--green-900)",
        color: "var(--cream-50)",
        padding: "18px 22px",
        borderRadius: 12,
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: "0 8px 30px rgba(15, 42, 31, 0.2)",
      }}
    >
      <code
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: "rgba(246, 241, 231, 0.4)" }}>{"<"}</span>
        <span style={{ color: "#E89464" }}>script</span>
        <span style={{ color: "rgba(246, 241, 231, 0.5)" }}> src=</span>
        <span style={{ color: "#A0D8A0" }}>
          &quot;https://seeks.app/embed.js&quot;
        </span>
        <span style={{ color: "rgba(246, 241, 231, 0.5)" }}> data-id=</span>
        <span style={{ color: "#A0D8A0" }}>&quot;tahko-adv&quot;</span>
        <span style={{ color: "rgba(246, 241, 231, 0.4)" }}>{"/>"}</span>
      </code>
      <button
        onClick={() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
        style={{
          padding: "6px 12px",
          borderRadius: 6,
          background: copied ? "var(--terracotta)" : "rgba(246, 241, 231, 0.1)",
          color: copied ? "var(--green-900)" : "var(--cream-50)",
          border: "1px solid rgba(246, 241, 231, 0.2)",
          fontSize: 11,
          fontWeight: 500,
          fontFamily: "inherit",
          cursor: "pointer",
          transition: "all 200ms",
        }}
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}

function BrowserMock({
  active,
  setActive,
}: {
  active: number;
  setActive: (i: number) => void;
}) {
  const tabs = ["Snowmobile Safari", "Campfire Tour", "E-bike Day"];
  const products = [
    {
      title: "Snowmobile Safari",
      img: "https://images.unsplash.com/photo-1518225057636-9aaa42b0bcd9?w=900&q=80",
      duration: "2h",
      price: "€163",
      slots: [
        { time: "09:00", avail: "Available · 8 left" },
        { time: "12:00", avail: "Available · 4 left" },
        { time: "14:00", avail: "Limited · 1 left", tight: true },
      ],
    },
    {
      title: "Campfire Tour",
      img: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=900&q=80",
      duration: "3h",
      price: "€89",
      slots: [
        { time: "10:00", avail: "Available · 12 left" },
        { time: "15:00", avail: "Available · 6 left" },
        { time: "18:00", avail: "Limited · 2 left", tight: true },
      ],
    },
    {
      title: "E-bike Day",
      img: "https://images.unsplash.com/photo-1502943693086-33b5b1cfdf2f?w=900&q=80",
      duration: "6h",
      price: "€120",
      slots: [
        { time: "09:00", avail: "Available · 5 left" },
        { time: "11:00", avail: "Limited · 1 left", tight: true },
      ],
    },
  ];
  const current = products[active];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        background: "var(--white)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(15, 42, 31, 0.18)",
        border: "1px solid var(--line)",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background: "var(--cream-200)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "#E47474",
            }}
          />
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "#E8B547",
            }}
          />
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "#7BC07A",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.7)",
            padding: "5px 12px",
            borderRadius: 6,
            fontSize: 11,
            color: "var(--ink-sub)",
            fontFamily: "var(--font-mono)",
          }}
        >
          tahkoadventure.fi/book
        </div>
      </div>

      {/* Host site header */}
      <div
        style={{
          padding: "14px 22px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            color: "var(--ink)",
          }}
        >
          Tahko Adventure
        </span>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 11,
            color: "var(--ink-sub)",
          }}
        >
          <span>About</span>
          <span>Tours</span>
          <span>Contact</span>
        </div>
      </div>

      {/* Widget container */}
      <div
        style={{
          padding: 22,
          background: "linear-gradient(180deg, var(--white), var(--cream-50))",
        }}
      >
        <div
          style={{
            background: "var(--white)",
            border: "1px dashed var(--terracotta)",
            borderRadius: 12,
            padding: 18,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -10,
              left: 14,
              background: "var(--cream-50)",
              padding: "0 8px",
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.14em",
              color: "var(--terracotta)",
            }}
          >
            SEEKS EMBED
          </span>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 16,
              borderBottom: "1px solid var(--line)",
            }}
          >
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActive(i)}
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: active === i ? "var(--green-900)" : "var(--ink-sub)",
                  borderBottom:
                    active === i
                      ? "2px solid var(--green-900)"
                      : "2px solid transparent",
                  marginBottom: -1,
                  transition: "all 200ms",
                  background: "transparent",
                  border: "none",
                  borderBottomWidth: 2,
                  borderBottomStyle: "solid",
                  borderBottomColor:
                    active === i ? "var(--green-900)" : "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 8,
                    backgroundImage: `url(${current.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                      {current.title}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--green-800)",
                      }}
                    >
                      {current.price}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-sub)",
                      marginBottom: 10,
                    }}
                  >
                    {current.duration} · max 25 guests · EN, FI
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {["Outdoor", "Winter", "Guided"].map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 10,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "var(--cream-100)",
                          color: "var(--ink-sub)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date picker */}
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ink-sub)",
                    marginBottom: 6,
                  }}
                >
                  Pick a date
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 4,
                  }}
                >
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "6px 0",
                          textAlign: "center",
                          borderRadius: 6,
                          background:
                            i === 1 ? "var(--green-900)" : "var(--cream-100)",
                          color: i === 1 ? "var(--cream-50)" : "var(--ink)",
                          fontSize: 10,
                        }}
                      >
                        <div style={{ fontSize: 9, opacity: 0.7 }}>{d}</div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          {18 + i}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Time slots */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ink-sub)",
                    marginBottom: 2,
                  }}
                >
                  Available times
                </div>
                {current.slots.map((slot, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background:
                        i === 0
                          ? "rgba(232, 148, 100, 0.08)"
                          : "var(--cream-50)",
                      border:
                        i === 0
                          ? "1px solid var(--terracotta)"
                          : "1px solid transparent",
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          marginRight: 10,
                        }}
                      >
                        {slot.time}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: slot.tight ? "#B85C24" : "var(--ink-sub)",
                        }}
                      >
                        {slot.avail}
                      </span>
                    </div>
                    <button
                      style={{
                        padding: "5px 14px",
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        background:
                          i === 0 ? "var(--green-900)" : "transparent",
                        color: i === 0 ? "var(--cream-50)" : "var(--green-900)",
                        border: i === 0 ? "none" : "1px solid var(--green-900)",
                        cursor: "pointer",
                      }}
                    >
                      {i === 0 ? "Book →" : "Select"}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            fontSize: 10,
            color: "var(--ink-sub)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Powered by Seeks &amp; Explore · Secure payments via Stripe
        </div>
      </div>
    </motion.div>
  );
}

function LandingEmbed({ t }: { t: (typeof translations)["en"] }) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);

  // Auto-cycle tabs
  useEffect(() => {
    if (hovering) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % 3), 4500);
    return () => clearInterval(timer);
  }, [active, hovering]);

  return (
    <section
      id="embed"
      style={{
        padding: "160px 0",
        background: "var(--cream-100)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: 96,
            alignItems: "center",
          }}
          className="embed-grid"
        >
          {/* Left: copy */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>
              {t.embed.eyebrow}
            </div>
            <h2
              className="display"
              style={{ fontSize: "clamp(40px, 5vw, 64px)", margin: "0 0 28px" }}
            >
              {t.embed.title} <em>{t.embed.titleEm}</em>
            </h2>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--ink-sub)",
                marginBottom: 36,
                maxWidth: 480,
              }}
            >
              {t.embed.subtitle}
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px" }}>
              {t.embed.bullets.map((bullet, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--line)",
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--terracotta)",
                      color: "var(--green-900)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icons.check />
                  </span>
                  {bullet}
                </motion.li>
              ))}
            </ul>

            <CodeSnippet />
          </div>

          {/* Right: browser mock */}
          <div
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <BrowserMock active={active} setActive={setActive} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== WHO FOR =====
function AudienceTile({
  a,
  idx,
}: {
  a: { title: string; body: string };
  idx: number;
}) {
  const [hover, setHover] = useState(false);
  const isRight = idx % 2 === 1;
  const isBottom = idx >= 2;

  const images = [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80",
    "https://images.unsplash.com/photo-1568849676085-51415703900f?w=900&q=80",
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=900&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: idx * 0.08 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        padding: 48,
        borderRight: isRight ? "none" : "1px solid rgba(246, 241, 231, 0.12)",
        borderBottom: isBottom ? "none" : "1px solid rgba(246, 241, 231, 0.12)",
        cursor: "pointer",
        overflow: "hidden",
        minHeight: 280,
      }}
    >
      {/* Hover image */}
      <motion.div
        animate={{ opacity: hover ? 0.18 : 0, scale: hover ? 1 : 1.1 }}
        transition={{ duration: 0.6 }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${images[idx]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 18,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--terracotta)",
            marginTop: 12,
            flexShrink: 0,
            boxShadow: hover ? "0 0 16px var(--terracotta)" : "none",
            transition: "box-shadow 300ms",
          }}
        />
        <div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              margin: "0 0 12px",
              lineHeight: 1.15,
            }}
          >
            {a.title}
          </h3>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              color: "rgba(246, 241, 231, 0.65)",
              margin: 0,
              maxWidth: 380,
            }}
          >
            {a.body}
          </p>
        </div>
      </div>

      <motion.div
        animate={{ opacity: hover ? 1 : 0, x: hover ? 0 : -8 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute",
          bottom: 36,
          right: 48,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid rgba(246, 241, 231, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--terracotta)",
        }}
      >
        <Icons.arrowUpRight />
      </motion.div>
    </motion.div>
  );
}

function LandingWhoFor({ t }: { t: (typeof translations)["en"] }) {
  return (
    <section
      style={{
        padding: "160px 0 140px",
        background: "var(--green-900)",
        color: "var(--cream-50)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background type echo */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "-3%",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(180px, 22vw, 320px)",
          color: "rgba(246, 241, 231, 0.04)",
          letterSpacing: "-0.04em",
          lineHeight: 0.85,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        built for
      </div>

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 80, maxWidth: 760 }}>
          <div
            className="eyebrow"
            style={{ color: "rgba(246, 241, 231, 0.6)", marginBottom: 24 }}
          >
            {t.whoFor.eyebrow}
          </div>
          <h2
            className="display"
            style={{
              color: "var(--cream-50)",
              fontSize: "clamp(40px, 5.5vw, 72px)",
              margin: 0,
            }}
          >
            {t.whoFor.title} <em>{t.whoFor.titleEm}</em>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 0,
          }}
          className="who-grid"
        >
          {t.whoFor.audiences.map((a, i) => (
            <AudienceTile key={i} a={a} idx={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            marginTop: 80,
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 3vw, 36px)",
            fontStyle: "italic",
            color: "rgba(246, 241, 231, 0.8)",
            lineHeight: 1.3,
            maxWidth: 820,
            margin: "80px auto 0",
          }}
        >
          {t.whoFor.closing}
        </motion.div>
      </div>
    </section>
  );
}

// ===== CTA =====
function LandingCTA({ t }: { t: (typeof translations)["en"] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={ref}
      style={{
        padding: "160px 0",
        background: "var(--terracotta)",
        color: "var(--green-900)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: "1px dashed rgba(15, 42, 31, 0.2)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          bottom: -160,
          left: -160,
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: "1px dashed rgba(15, 42, 31, 0.15)",
          pointerEvents: "none",
        }}
      />

      <div
        className="container"
        style={{ position: "relative", textAlign: "center" }}
      >
        <div
          className="eyebrow"
          style={{
            color: "rgba(15, 42, 31, 0.7)",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          {t.cta.eyebrow}
        </div>

        <motion.h2
          style={{ y: titleY }}
          className="display"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span
            style={{
              fontSize: "clamp(56px, 8.5vw, 132px)",
              display: "block",
              color: "var(--green-900)",
              margin: "0 0 8px",
              lineHeight: 0.95,
            }}
          >
            {t.cta.line1}
          </span>
          <span
            style={{
              fontSize: "clamp(56px, 8.5vw, 132px)",
              display: "block",
              fontStyle: "italic",
              color: "var(--green-900)",
              lineHeight: 0.95,
            }}
          >
            {t.cta.line2}
          </span>
        </motion.h2>

        <p
          style={{
            maxWidth: 520,
            margin: "40px auto 48px",
            fontSize: 18,
            lineHeight: 1.55,
            color: "rgba(15, 42, 31, 0.78)",
          }}
        >
          {t.cta.subtitle}
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="#contact"
            className="btn"
            style={{
              background: "var(--green-900)",
              color: "var(--cream-50)",
              padding: "18px 28px",
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 999,
            }}
          >
            {t.cta.ctaPrimary} <Icons.arrow />
          </a>
          <a
            href="#contact"
            className="btn"
            style={{
              background: "transparent",
              color: "var(--green-900)",
              padding: "18px 28px",
              fontSize: 15,
              fontWeight: 500,
              borderRadius: 999,
              border: "1px solid var(--green-900)",
            }}
          >
            {t.cta.ctaSecondary}
          </a>
        </div>

        {/* Stats strip */}
        <div
          style={{
            marginTop: 96,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
            paddingTop: 48,
            borderTop: "1px solid rgba(15, 42, 31, 0.2)",
          }}
          className="stats-grid"
        >
          {t.cta.stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              style={{ textAlign: "left" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(36px, 4vw, 56px)",
                  lineHeight: 1,
                  marginBottom: 6,
                  color: "var(--green-900)",
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(15, 42, 31, 0.65)",
                }}
              >
                {s.l}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== FOOTER / CONTACT =====
function FormField({
  label,
  name,
  type = "text",
  textarea,
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid var(--line)",
    borderRadius: 8,
    background: "var(--cream-50)",
    fontFamily: "inherit",
    fontSize: 14,
    color: "var(--ink)",
    outline: "none",
    transition: "border-color 180ms",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 6,
          color: "var(--ink-sub)",
        }}
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          required={required}
          style={fieldStyle}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          style={fieldStyle}
        />
      )}
    </div>
  );
}

function ContactInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ paddingBottom: 18, borderBottom: "1px solid var(--line)" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-sub)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 16, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}

function LandingFooter({
  t,
  language,
}: {
  t: (typeof translations)["en"];
  language: Language;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    privacyConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.privacyConsent) {
      setSubmitStatus("error");
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          message: form.message,
          language,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitStatus("success");
        setForm({
          name: "",
          email: "",
          phone: "",
          message: "",
          privacyConsent: false,
        });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      id="contact"
      style={{ background: "var(--cream-50)", position: "relative" }}
    >
      {/* Contact section */}
      <section style={{ padding: "140px 0 100px" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "start",
            }}
            className="contact-grid"
          >
            {/* Left: copy */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 24 }}>
                {t.contact.eyebrow}
              </div>
              <h2
                className="display"
                style={{
                  fontSize: "clamp(40px, 5vw, 64px)",
                  margin: "0 0 28px",
                }}
              >
                {t.contact.title} <em>{t.contact.titleEm}</em>
                {t.contact.titleEnd}
              </h2>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.55,
                  color: "var(--ink-sub)",
                  marginBottom: 36,
                  maxWidth: 440,
                }}
              >
                {t.contact.subtitle}
              </p>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <ContactInfoRow label="Email" value="hello@seeks-explore.fi" />
                <ContactInfoRow
                  label="Investor inquiries"
                  value="jyri.taskinen@tassuconsulting.com"
                />
                <ContactInfoRow
                  label="Office"
                  value="Tahko, Finland · open Mon–Fri"
                />
              </div>
            </div>

            {/* Right: form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{
                background: "var(--white)",
                border: "1px solid var(--line)",
                borderRadius: 16,
                padding: 32,
              }}
            >
              <FormField
                label={t.contact.name}
                name="name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
              />
              <FormField
                label={t.contact.email}
                name="email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                required
              />
              <FormField
                label={t.contact.phone}
                name="phone"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <FormField
                label={t.contact.message}
                name="message"
                textarea
                value={form.message}
                onChange={(v) => setForm({ ...form, message: v })}
                required
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  margin: "8px 0 20px",
                  fontSize: 13,
                  color: "var(--ink-sub)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.privacyConsent}
                  onChange={(e) =>
                    setForm({ ...form, privacyConsent: e.target.checked })
                  }
                  style={{ accentColor: "var(--green-800)" }}
                />
                {t.contact.privacyConsent}{" "}
                <Link
                  href="/privacy"
                  style={{ textDecoration: "underline", color: "inherit" }}
                >
                  {t.contact.privacyLink}
                </Link>
              </label>

              {submitStatus === "success" && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 8,
                    background: "#DAF0DA",
                    color: "#1F6B3A",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {t.contact.success}
                </div>
              )}
              {submitStatus === "error" && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 8,
                    background: "#FFD9D9",
                    color: "#A33",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {t.contact.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "14px 22px",
                  background:
                    submitStatus === "success" ? "#1F6B3A" : "var(--green-800)",
                  color: "var(--cream-50)",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  border: "none",
                  transition: "background 200ms",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  fontFamily: "inherit",
                }}
              >
                {isSubmitting ? t.contact.sending : t.contact.submit}
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Footer bottom strip */}
      <div
        style={{
          background: "var(--green-900)",
          color: "rgba(246, 241, 231, 0.7)",
          padding: "24px 0",
          fontSize: 12,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo light />
            <span>{t.footer.copyright}</span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 12 }}>
            <Link href="/privacy" style={{ color: "inherit" }}>
              Privacy
            </Link>
            <a href="#" style={{ color: "inherit" }}>
              Terms
            </a>
            <a href="#" style={{ color: "inherit" }}>
              Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ===== MAIN PAGE =====
export default function LandingPage() {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  return (
    <div
      style={{
        background: "var(--cream-50)",
        color: "var(--ink)",
        fontFamily: "var(--font-geist-sans)",
        overflowX: "hidden",
      }}
    >
      <LandingNav language={language} setLanguage={setLanguage} t={t} />
      <LandingHero t={t} />
      <LandingMarquee />
      <LandingFeatures t={t} />
      <LandingDashboard t={t} />
      <LandingHowItWorks t={t} />
      <LandingEmbed t={t} />
      <LandingWhoFor t={t} />
      <LandingCTA t={t} />
      <LandingFooter t={t} language={language} />
    </div>
  );
}
