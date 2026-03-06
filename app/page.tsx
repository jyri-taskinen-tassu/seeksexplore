"use client";

import { useState } from "react";

type Language = "en" | "fi";

const translations = {
  en: {
    nav: {
      features: "Features",
      howItWorks: "How it works",
      contact: "Contact",
    },
    hero: {
      headline: "Run your experiences without the daily chaos.",
      subhead: "Seeks & Explore helps activity and experience providers stay on top of departures, resources and bookings — without constant manual work.",
      tagline: "Infrastructure for operational clarity — built with providers, rolling out step by step.",
      ctaPrimary: "Contact us",
      ctaSecondary: "Request a demo",
    },
    features: {
      title: "What it helps with",
      operational: {
        title: "Operational overview",
        description: "See all departures and allocations at a glance. Know what's happening today, tomorrow, and next week without switching between systems.",
      },
      resource: {
        title: "Resource awareness",
        description: "Track capacity, maintenance schedules, and buffers. Know exactly what's available and what needs attention before it becomes a problem.",
      },
      booking: {
        title: "Booking clarity",
        description: "Understand what's coming today and tomorrow. Get clear visibility into guest counts, allocations, and any potential conflicts.",
      },
    },
    howItWorks: {
      title: "How it works",
      step1: {
        title: "Add products",
        description: "Create your experiences with AI-assisted setup or manual configuration. Define what you offer and how it works.",
      },
      step2: {
        title: "Set resource rules",
        description: "Optionally configure your resources — vehicles, equipment, guides. The system handles allocation automatically.",
      },
      step3: {
        title: "Monitor availability & departures",
        description: "Stay on top of your operations with real-time visibility. See conflicts, capacity issues, and upcoming departures all in one place.",
      },
    },
    whoItsFor: {
      title: "Who it's for",
      item1: {
        title: "Experience & activity providers",
        description: "Outdoor and indoor experiences — from forest adventures to distillery tours.",
      },
      item2: {
        title: "Tours, tastings & distillery visits",
        description: "Manage scheduled departures, capacity, and guest bookings seamlessly.",
      },
      item3: {
        title: "Guided activities, workshops and classes",
        description: "Keep track of schedules, instructor availability, and participant bookings.",
      },
      item4: {
        title: "Small teams that need clarity",
        description: "Without constant manual work — see what's happening at a glance.",
      },
      closing: "Whether your experience happens in the forest or indoors — the goal is the same: fewer moving parts, smoother days, and more sales.",
    },
    socialProof: "Built in Finland. Provider-first. Designed for real operations.",
    contact: {
      title: "Get in touch",
      name: "Name",
      email: "Email",
      message: "Message",
      submit: "Send message",
      directEmail: "Or email us directly:",
      replyTime: "We reply within 48h.",
    },
    footer: {
      copyright: "All rights reserved.",
      investor: "Investor inquiries:",
    },
  },
  fi: {
    nav: {
      features: "Ominaisuudet",
      howItWorks: "Miten se toimii",
      contact: "Ota yhteyttä",
    },
    hero: {
      headline: "Järjestä elämyksesi ilman päivittäistä kaaosta.",
      subhead: "Seeks & Explore auttaa aktiviteetti- ja elämyspalveluntarjoajia pysymään perillä lähdöistä, resursseista ja varauksista — ilman jatkuvaa manuaalista työtä.",
      tagline: "Infrastruktuuri operatiiviseen selkeyteen — rakennettu yhdessä tarjoajien kanssa, käyttöönotto vaiheittain.",
      ctaPrimary: "Ota yhteyttä",
      ctaSecondary: "Pyydä demo",
    },
    features: {
      title: "Mihin se auttaa",
      operational: {
        title: "Operatiivinen yleiskuva",
        description: "Näe kaikki lähdöt ja allokoinnit yhdellä silmäyksellä. Tiedä mitä tapahtuu tänään, huomenna ja ensi viikolla ilman järjestelmien välillä selaamista.",
      },
      resource: {
        title: "Resurssinäkymä",
        description: "Seuraa kapasiteettia, huoltosuunnitelmia ja puskureita. Tiedä tarkalleen mitä on saatavilla ja mitä tarvitsee huomioida ennen kuin siitä tulee ongelma.",
      },
      booking: {
        title: "Varauksien selkeys",
        description: "Ymmärrä mitä on tulossa tänään ja huomenna. Saat selkeän näkymän vieraiden määriin, allokointiin ja mahdollisiin ali-/ylibuukkauksiin.",
      },
    },
    howItWorks: {
      title: "Miten se toimii",
      step1: {
        title: "Lisää tuotteet",
        description: "Luo palvelusi ja elämyksesi manuaalisesti tai tekoälyavusteisella asetuksella. Määritä tarvittavat tiedot, ajat ja paikat.",
      },
      step2: {
        title: "Aseta resurssisäännöt",
        description: "Jos tarvetta, kerro resurssisi — ajoneuvot, laitteet, oppaat. Järjestelmä hoitaa allokoinnin automaattisesti.",
      },
      step3: {
        title: "Seuraa saatavuutta ja lähdöjä",
        description: "Pysy operaatioidesi perässä reaaliaikaisella näkyvyydellä. Näe konfliktit, kapasiteettiongelmat ja tulevat lähdöt yhdessä paikassa.",
      },
    },
    whoItsFor: {
      title: "Kenelle se on",
      item1: {
        title: "Elämys- ja aktiviteettitarjoajat",
        description: "Ulko- ja sisätilaelämykset — metsäseikkailuista panimokierroksille.",
      },
      item2: {
        title: "Kierrokset, maistelut ja panimovierailut",
        description: "Hallitse ajoitettuja lähtöjä, kapasiteettia ja vierasvarauksia saumattomasti.",
      },
      item3: {
        title: "Ohjatut aktiviteetit, työpajat ja luokat",
        description: "Pidä kirjaa aikatauluista, ohjaajien saatavuudesta ja osallistujien varauksista.",
      },
      item4: {
        title: "Pienet tiimit, jotka tarvitsevat selkeyttä",
        description: "Ilman jatkuvaa manuaalista työtä — näe mitä tapahtuu yhdellä silmäyksellä.",
      },
      closing: "Tapahtuuko elämyksesi metsässä vai sisätiloissa — tavoite on sama: vähemmän liikkuvia osia, sujuvammat päivät ja enemmän myyntiä.",
    },
    socialProof: "Rakennettu Suomessa. Apuna yrityksille. Suunniteltu todelliseen tarpeeseen.",
    contact: {
      title: "Ota yhteyttä",
      name: "Nimi",
      email: "Sähköposti",
      message: "Viesti",
      submit: "Lähetä viesti",
      directEmail: "Tai lähetä sähköpostia suoraan:",
      replyTime: "Vastaamme 48 tunnin sisällä.",
    },
    footer: {
      copyright: "Kaikki oikeudet pidätetään.",
      investor: "Sijoittajakyselyt:",
    },
  },
};

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const t = translations[language];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    alert('Form submit started!'); // Debug
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
          language: language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus('error');
        console.error('API Error:', data);
        alert('Error: ' + (data.error || 'Failed to send') + (data.details ? '\nDetails: ' + JSON.stringify(data.details) : ''));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      alert('Error: ' + (error instanceof Error ? error.message : 'Failed to send'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-semibold text-[var(--color-forest)]">
              Seeks & Explore
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-8">
                <a
                  href="#features"
                  className="text-sm font-medium text-neutral-700 hover:text-[var(--color-forest)] transition-colors"
                >
                  {t.nav.features}
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-neutral-700 hover:text-[var(--color-forest)] transition-colors"
                >
                  {t.nav.howItWorks}
                </a>
                <a
                  href="#contact"
                  className="text-sm font-medium text-neutral-700 hover:text-[var(--color-forest)] transition-colors"
                >
                  {t.nav.contact}
                </a>
              </div>
              {/* Language Toggle */}
              <div className="flex items-center gap-2 border-l border-neutral-200 pl-4 ml-4">
                <button
                  onClick={() => setLanguage("en")}
                  className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                    language === "en"
                      ? "text-[var(--color-forest)] bg-[var(--color-cream)]/50"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("fi")}
                  className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                    language === "fi"
                      ? "text-[var(--color-forest)] bg-[var(--color-cream)]/50"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  FI
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--color-cream)]/40 via-white to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--color-forest)] mb-6 leading-tight">
            {t.hero.headline}
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subhead}
          </p>
          <p className="text-sm text-[var(--color-sage)] mb-10 italic font-medium">
            {t.hero.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="px-8 py-4 bg-[var(--color-forest)] text-white rounded-lg font-semibold hover:bg-[#0f2a1f] transition-colors shadow-lg hover:shadow-xl"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#contact"
              className="px-8 py-4 bg-white text-[var(--color-forest)] border-2 border-[var(--color-forest)] rounded-lg font-semibold hover:bg-[var(--color-cream)] hover:border-[var(--color-sage)] transition-colors"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* What it helps with */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-cream)]/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-forest)] text-center mb-12">
            {t.features.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-[var(--color-sky)]/30 hover:border-[var(--color-sky)]/60 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-sky)]/30 to-[var(--color-sky)]/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[var(--color-sky)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-forest)] mb-3">
                {t.features.operational.title}
              </h3>
              <p className="text-neutral-600">
                {t.features.operational.description}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-[var(--color-sage)]/30 hover:border-[var(--color-sage)]/60 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-sage)]/30 to-[var(--color-sage)]/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[var(--color-sage)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-forest)] mb-3">
                {t.features.resource.title}
              </h3>
              <p className="text-neutral-600">
                {t.features.resource.description}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/60 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-accent)]/30 to-[var(--color-accent)]/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[var(--color-accent)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-forest)] mb-3">
                {t.features.booking.title}
              </h3>
              <p className="text-neutral-600">
                {t.features.booking.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[var(--color-cream)]/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-forest)] text-center mb-12">
            {t.howItWorks.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-sky)] to-[var(--color-forest)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-forest)] mb-3">
                {t.howItWorks.step1.title}
              </h3>
              <p className="text-neutral-600">
                {t.howItWorks.step1.description}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-forest)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-forest)] mb-3">
                {t.howItWorks.step2.title}
              </h3>
              <p className="text-neutral-600">
                {t.howItWorks.step2.description}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-forest)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-forest)] mb-3">
                {t.howItWorks.step3.title}
              </h3>
              <p className="text-neutral-600">
                {t.howItWorks.step3.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-cream)]/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-forest)] text-center mb-12">
            {t.whoItsFor.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-[var(--color-forest)] mb-1">
                  {t.whoItsFor.item1.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t.whoItsFor.item1.description}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-[var(--color-forest)] mb-1">
                  {t.whoItsFor.item2.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t.whoItsFor.item2.description}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-[var(--color-forest)] mb-1">
                  {t.whoItsFor.item3.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t.whoItsFor.item3.description}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-[var(--color-forest)] mb-1">
                  {t.whoItsFor.item4.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t.whoItsFor.item4.description}
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-neutral-600 italic max-w-2xl mx-auto">
            {t.whoItsFor.closing}
          </p>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-[var(--color-cream)] bg-gradient-to-r from-[var(--color-cream)]/40 to-[var(--color-cream)]/20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-[var(--color-forest)] font-medium">
            {t.socialProof}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-forest)] text-center mb-12">
            {t.contact.title}
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
            <form 
              onSubmit={handleContactSubmit} 
              className="space-y-6"
              noValidate
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  {t.contact.name}
                </label>
                <input
                  type="text"
                  id="name"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  {t.contact.email}
                </label>
                <input
                  type="email"
                  id="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  {t.contact.message}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent outline-none resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                id="contact-submit-button"
                disabled={isSubmitting}
                onClick={() => {
                  alert('Button clicked!');
                }}
                className="w-full px-8 py-4 bg-[var(--color-forest)] text-white rounded-lg font-semibold hover:bg-[#0f2a1f] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ cursor: 'pointer' }}
              >
                {isSubmitting 
                  ? (language === 'en' ? 'Sending...' : 'Lähetetään...')
                  : t.contact.submit
                }
              </button>
              
              {submitStatus === 'success' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                  {language === 'en' 
                    ? '✓ Message sent successfully! We\'ll get back to you within 48 hours.'
                    : '✓ Viesti lähetetty onnistuneesti! Vastaamme sinulle 48 tunnin sisällä.'
                  }
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {language === 'en'
                    ? '✗ Failed to send message. Please try again or email us directly at hello@seeksexplore.com'
                    : '✗ Viestin lähetys epäonnistui. Yritä uudelleen tai lähetä sähköpostia suoraan osoitteeseen hello@seeksexplore.com'
                  }
                </div>
              )}
            </form>
            <div className="mt-8 pt-8 border-t border-neutral-200 text-center">
              <p className="text-sm text-neutral-600 mb-2">
                {t.contact.directEmail}
              </p>
              <a
                href="mailto:hello@seeksexplore.com"
                className="text-[var(--color-forest)] hover:underline font-medium"
              >
                hello@seeksexplore.com
              </a>
              <p className="text-xs text-neutral-500 mt-4">
                {t.contact.replyTime}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-forest)] text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm">
              © {new Date().getFullYear()} Seeks & Explore. {t.footer.copyright}
            </div>
            <div className="text-sm">
              {t.footer.investor}{" "}
              <a
                href="mailto:hello@seeksexplore.com"
                className="hover:underline"
              >
                hello@seeksexplore.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
