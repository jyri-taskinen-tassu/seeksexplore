import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import StripeProvider from "./StripeProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Book your adventure · Seeks & Explore",
  description: "Browse and book unique outdoor experiences directly.",
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      style={{
        minHeight: "100vh",
        background: "#F4F1EA",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        color: "#0A0A0A",
      }}
    >
      <StripeProvider>{children}</StripeProvider>
    </div>
  );
}
