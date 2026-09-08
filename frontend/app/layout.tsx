import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FORMA Everyday | Modern Fashion & Essentials for Men, Women & Kids",
  description:
    "Shop friendly, everyday fashion essentials. Quality tees, relaxed denim, activewear, and daily basics at unbeatable prices. Free shipping & 30-day easy returns.",
  keywords: ["everyday clothes", "fashion", "affordable clothing", "men", "women", "kids", "sale"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
