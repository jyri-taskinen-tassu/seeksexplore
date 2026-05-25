"use client";

import React, { useState } from "react";

interface IntegrateClientProps {
  providerName: string;
  providerSlug: string;
}

export default function IntegrateClient({ providerName, providerSlug }: IntegrateClientProps) {
  const [activeTab, setActiveTab] = useState<"link" | "iframe" | "button">("link");
  const [copied, setCopied] = useState(false);

  // Fallback to localhost if window is not defined (SSR)
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://seeksandexplore.com";
  const bookingUrl = `${baseUrl}/book/${providerSlug}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iframeCode = `<iframe 
  src="${bookingUrl}" 
  width="100%" 
  height="700px" 
  frameborder="0" 
  style="border: 0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
></iframe>`;

  const buttonCode = `<a href="${bookingUrl}" 
   target="_blank" 
   style="display: inline-block; background-color: #0d1f17; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-family: sans-serif;"
>
  Book Now with ${providerName}
</a>`;

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <header className="border-b border-[var(--line)] bg-white sticky top-0 z-10">
        <div className="mx-auto flex w-full max-w-[1000px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--green-900)] text-white shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[var(--green-900)]">Integrate Booking</h1>
              <p className="text-sm font-bold text-[var(--ink)] opacity-60">Add Seeks & Explore to your existing website</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1000px] px-6 py-8">
        <div className="bg-white rounded-2xl border border-[var(--line)] shadow-sm overflow-hidden">
          <div className="flex border-b border-[var(--line)] bg-[var(--cream-50)]/30">
            <button
              onClick={() => setActiveTab("link")}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${activeTab === "link" ? "bg-white text-[var(--green-900)] border-b-2 border-b-[var(--green-900)]" : "text-[var(--ink-sub)] hover:text-[var(--ink)]"}`}
            >
              Direct Link
            </button>
            <button
              onClick={() => setActiveTab("iframe")}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${activeTab === "iframe" ? "bg-white text-[var(--green-900)] border-b-2 border-b-[var(--green-900)]" : "text-[var(--ink-sub)] hover:text-[var(--ink)]"}`}
            >
              iFrame Embed
            </button>
            <button
              onClick={() => setActiveTab("button")}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${activeTab === "button" ? "bg-white text-[var(--green-900)] border-b-2 border-b-[var(--green-900)]" : "text-[var(--ink-sub)] hover:text-[var(--ink)]"}`}
            >
              Booking Button
            </button>
          </div>

          <div className="p-8">
            {activeTab === "link" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-[var(--green-900)] mb-2">Direct Booking Link</h2>
                  <p className="text-[var(--ink)] opacity-70 leading-relaxed">
                    The simplest way to start taking bookings. Share this link in your social media bios, 
                    email signatures, or add it as a menu item on your website.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-4 rounded-xl bg-[var(--cream-50)] border border-[var(--line)]">
                  <code className="flex-1 text-sm font-mono text-[var(--green-900)] break-all">{bookingUrl}</code>
                  <button
                    onClick={() => copyToClipboard(bookingUrl)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${copied ? "bg-emerald-600 text-white" : "bg-[var(--green-900)] text-white hover:opacity-90"}`}
                  >
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                        Copy Link
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-6 border-t border-[var(--line)]">
                  <h3 className="text-sm font-bold text-[var(--green-900)] uppercase tracking-wider opacity-70 mb-4">Recommended for:</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-center gap-3 text-sm font-bold text-[var(--ink)]">
                      <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-xs">✓</span>
                      Instagram / Facebook bio
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-[var(--ink)]">
                      <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-xs">✓</span>
                      WhatsApp business profile
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-[var(--ink)]">
                      <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-xs">✓</span>
                      Google Maps listing
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-[var(--ink)]">
                      <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-xs">✓</span>
                      Simple &quot;Book Now&quot; menu links
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "iframe" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-[var(--green-900)] mb-2">iFrame Embed</h2>
                  <p className="text-[var(--ink)] opacity-70 leading-relaxed">
                    Keep customers on your website by embedding the entire booking flow into your page. 
                    Copy the code below and paste it into your website&apos;s HTML editor.
                  </p>
                </div>

                <div className="relative group">
                  <pre className="p-6 rounded-xl bg-[var(--ink)] text-emerald-400 text-xs font-mono overflow-x-auto border border-white/10 shadow-inner">
                    {iframeCode}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(iframeCode)}
                    className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${copied ? "bg-emerald-600 text-white" : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"}`}
                  >
                    {copied ? "Copied!" : "Copy Code"}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="flex gap-3">
                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <div>
                      <p className="text-sm font-bold">Important Note</p>
                      <p className="text-xs mt-1 font-medium opacity-80">Make sure your website supports iFrames. If you use a website builder like Wix, Squarespace, or WordPress, use the &quot;HTML&quot; or &quot;Embed&quot; block.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "button" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-[var(--green-900)] mb-2">Booking Button</h2>
                  <p className="text-[var(--ink)] opacity-70 leading-relaxed">
                    Add a professional &quot;Book Now&quot; button anywhere on your site. This button matches 
                    your Seeks & Explore branding and opens your booking page in a new tab.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--ink)] opacity-50 uppercase tracking-widest mb-3">Preview</h3>
                    <div className="p-10 rounded-xl bg-[var(--cream-50)] border border-[var(--line)] grid place-items-center">
                      <div dangerouslySetInnerHTML={{ __html: buttonCode }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--ink)] opacity-50 uppercase tracking-widest mb-3">Code Snippet</h3>
                    <div className="relative group">
                      <pre className="p-4 rounded-xl bg-[var(--ink)] text-emerald-400 text-[10px] font-mono overflow-x-auto border border-white/10">
                        {buttonCode}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(buttonCode)}
                        className={`absolute top-2 right-2 flex items-center gap-2 px-2 py-1 rounded-md font-bold text-[10px] transition-all ${copied ? "bg-emerald-600 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm">
            <div className="h-10 w-10 rounded-full bg-[var(--cream-100)] text-[var(--green-900)] grid place-items-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--green-900)] mb-2">Need help?</h3>
            <p className="text-sm font-bold text-[var(--ink)] opacity-60 leading-relaxed">
              Our technical team can help you with the integration if you&apos;re feeling stuck. 
              Contact us at support@seeksandexplore.com
            </p>
          </div>
          <div className="bg-[var(--green-900)] p-6 rounded-2xl shadow-lg shadow-[var(--green-900)]/10 text-white">
            <div className="h-10 w-10 rounded-full bg-white/10 text-white grid place-items-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-2">SEO Ready</h3>
            <p className="text-sm font-medium opacity-80 leading-relaxed">
              All our booking pages are optimized for search engines and mobile devices, 
              ensuring your customers have the best experience regardless of where they find you.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
