"use client";

import { useState } from "react";
import Link from "next/link";

type Language = "en" | "fi";

const translations = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated:",
    sections: {
      dataCollection: {
        title: "Data We Collect",
        content: "When you contact us through our contact form, we collect: your name, email address, phone number (optional), and message content. This information is used solely to respond to your inquiry."
      },
      dataUse: {
        title: "How We Use Your Data",
        content: "Your contact information is used exclusively to respond to your message. We do not share your data with third parties, except for our email service provider (Resend) which is necessary to send you a response."
      },
      dataStorage: {
        title: "Data Storage",
        content: "Your contact information is stored securely and retained only as long as necessary to respond to your inquiry or as required by law."
      },
      yourRights: {
        title: "Your Rights",
        content: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us at hello@seeksexplore.com."
      },
      contact: {
        title: "Contact Us",
        content: "If you have questions about this privacy policy, please contact us at hello@seeksexplore.com."
      }
    },
    back: "Back to home"
  },
  fi: {
    title: "Tietosuojaseloste",
    lastUpdated: "Päivitetty:",
    sections: {
      dataCollection: {
        title: "Keräämämme tiedot",
        content: "Kun otat meihin yhteyttä lomakkeen kautta, keräämme: nimesi, sähköpostiosoitteesi, puhelinnumerosi (valinnainen) ja viestisi sisällön. Näitä tietoja käytetään ainoastaan vastaamiseen."
      },
      dataUse: {
        title: "Tietojen käyttö",
        content: "Yhteystietojasi käytetään ainoastaan vastaamiseen. Emme jaa tietojasi kolmansien osapuolien kanssa, paitsi sähköpostipalveluntarjoajamme (Resend) kanssa, joka on välttämätön vastauksen lähettämiseen."
      },
      dataStorage: {
        title: "Tietojen säilytys",
        content: "Yhteystietosi säilytetään turvallisesti ja niitä säilytetään vain niin kauan kuin on tarpeen vastaamiseen tai laki vaatii."
      },
      yourRights: {
        title: "Oikeutesi",
        content: "Sinulla on oikeus tarkastaa, korjata tai poistaa henkilötietosi milloin tahansa. Ota yhteyttä osoitteeseen hello@seeksexplore.com."
      },
      contact: {
        title: "Ota yhteyttä",
        content: "Jos sinulla on kysymyksiä tietosuojaselosteesta, ota yhteyttä osoitteeseen hello@seeksexplore.com."
      }
    },
    back: "Takaisin etusivulle"
  }
};

export default function PrivacyPage() {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-semibold text-[var(--color-forest)]">
              Seeks & Explore
            </Link>
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
      </nav>

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-sm text-[var(--color-forest)] hover:underline mb-8 inline-block">
            ← {t.back}
          </Link>
          
          <h1 className="text-4xl font-bold text-[var(--color-forest)] mb-4">
            {t.title}
          </h1>
          
          <p className="text-sm text-neutral-500 mb-12">
            {t.lastUpdated} {new Date().toLocaleDateString(language === "en" ? "en-US" : "fi-FI")}
          </p>

          <div className="space-y-8">
            {Object.values(t.sections).map((section, index) => (
              <div key={index} className="border-b border-neutral-200 pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-[var(--color-forest)] mb-4">
                  {section.title}
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
