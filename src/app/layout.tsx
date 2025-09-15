"use client";

import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/locale-context";

export const metadata: Metadata = {
  title: "Liora – Aegis Safety App",
  description: "A single-page safety companion with multilingual support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Keep global providers only; remove sandbox/iframe scripts and dev-only reporters to prevent proxy errors */}
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}