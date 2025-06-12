import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerProvider } from './sw-client';
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "GoldenHourToday | Sunrise, Sunset & Golden Hour Calculator",
  description: "Get accurate sunrise, sunset, and golden hour times for your location. Perfect for photographers, filmmakers, and outdoor enthusiasts.",
  keywords: "sunrise, sunset, golden hour, blue hour, photography, sun calculator, sunrise time, sunset time, first light, last light, dawn, dusk, twilight, sun position, sun tracker",
  authors: [
    {
      name: "GoldenHourToday",
      url: "https://goldenhourtoday.xyz",
    },
  ],
  creator: "GoldenHourToday",
  openGraph: {
    title: "GoldenHourToday | Sunrise, Sunset & Golden Hour Calculator",
    description: "Get accurate sunrise, sunset, and golden hour times for your location. Perfect for photographers, filmmakers, and outdoor enthusiasts.",
    url: "https://goldenhourtoday.xyz",
    siteName: "GoldenHourToday",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "GoldenHourToday | Sunrise, Sunset & Golden Hour Calculator",
    description: "Get accurate sunrise, sunset, and golden hour times for your location.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#F5831F",
};

// Service worker registration is handled by the imported ServiceWorkerProvider component

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
