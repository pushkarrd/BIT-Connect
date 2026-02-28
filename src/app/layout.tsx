import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BIT Connect — Academic Resource Hub",
  description:
    "A zero-friction, open-access academic repository and community hub for Bangalore Institute of Technology students. Browse notes, question papers, and PYQs instantly.",
  keywords: [
    "BIT",
    "Bangalore Institute of Technology",
    "notes",
    "question papers",
    "PYQs",
    "study materials",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
