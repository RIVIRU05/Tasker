import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { CountryProvider } from "@/lib/country";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const interDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700"],
});

const interText = Inter({
  subsets: ["latin"],
  variable: "--font-text",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Tasker: Find trusted local workers in Sri Lanka",
  description:
    "Post a task and get bids from verified plumbers, electricians, painters, movers and more across Colombo and Kandy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interDisplay.variable} ${interText.variable}`}>
      <body className="font-text antialiased">
        <SessionProvider>
          <CountryProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </CountryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
