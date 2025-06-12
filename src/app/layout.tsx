import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sunrise, Sunset & Golden Hour Times | GoldenHourToday",
  description: "Get accurate sunrise, sunset, and golden hour times for your location. Perfect for photographers, outdoor enthusiasts, and anyone planning around daylight.",
  keywords: "sunrise, sunset, golden hour, blue hour, photography, sun calculator, daylight hours, twilight, dawn, dusk",
  authors: [{ name: "GoldenHourToday" }],
  creator: "GoldenHourToday",
  publisher: "GoldenHourToday",
  openGraph: {
    title: "Sunrise, Sunset & Golden Hour Times | GoldenHourToday",
    description: "Get accurate sunrise, sunset, and golden hour times for your location.",
    url: "https://goldenhourtoday.xyz",
    siteName: "GoldenHourToday",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sunrise, Sunset & Golden Hour Times | GoldenHourToday",
    description: "Get accurate sunrise, sunset, and golden hour times for your location.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#F5831F",
};

// Client component for service worker registration
'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from './sw-register';

function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F5831F" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerProvider>
          {children}
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
