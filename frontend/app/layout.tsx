import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";
import WarpBackground from "./components/WarpBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPT Index Dashboard",
  description: "DeFi Fundamentals Live: Performance Scores Based on On-Chain Metrics",
};

// Force dynamic rendering for entire app
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <WarpBackground />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
