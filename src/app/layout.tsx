import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { PwaInstallPrompt } from "@/components/ui/PwaInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cardly AI | Smart Business Card Scanner",
  description: "Instantly digitize business cards with AI. Extract contact details, infer geolocations, and save directly to your phone contacts with one tap.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cardly",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1020",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        {children}
        <Toaster position="top-center" duration={4000} />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
