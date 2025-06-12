'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function ForecastPage() {
  const [isPremium, setIsPremium] = useState(false);
  
  return (
    <>
      <Head>
        <title>7-Day Forecast | GoldenHourToday</title>
        <meta name="description" content="7-day forecast of sunrise, sunset, and golden hour times for your location." />
      </Head>
      
      <header className="sticky top-0 z-10 w-full bg-white/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-2 mb-6 shadow-sm">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold" style={{color: '#F5831F'}}>GoldenHourToday <span aria-label="sun" role="img">☀️</span></span>
          <Link href="/" className="text-xs text-blue-600 hover:underline">← Back to Today</Link>
        </div>
      </header>
      
      <main className="min-h-screen flex flex-col items-center p-4 bg-white dark:bg-black">
        <h1 className="text-2xl font-bold mb-6">7-Day Forecast</h1>
        
        {isPremium ? (
          <div className="w-full max-w-md border rounded-lg p-4 shadow bg-white dark:bg-zinc-900">
            <p className="text-center mb-4">Coming soon! 7-day forecast will show golden hours for the week ahead.</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-right">Sunrise</th>
                  <th className="py-2 text-right">Sunset</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(7)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  return (
                    <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-2">{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                      <td className="py-2 text-right">--:--</td>
                      <td className="py-2 text-right">--:--</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full max-w-md border rounded-lg p-8 shadow bg-white dark:bg-zinc-900 text-center">
            <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
            <p className="mb-4">7-day forecast is available to premium subscribers.</p>
            <button 
              onClick={() => setIsPremium(true)}
              className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        )}
      </main>
      
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 mt-12 py-4 text-center text-xs text-zinc-500">
        <div className="container mx-auto px-4">
          <p>© 2025 GoldenHourToday | <a href="/privacy" className="hover:underline">Privacy</a> | <a href="/contact" className="hover:underline">Contact</a></p>
        </div>
      </footer>
    </>
  );
}
