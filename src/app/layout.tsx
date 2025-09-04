import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BalanceHub - Collaborative Expense Tracking",
  description: "Fair-split expense tracking for groups with real-time updates and CS fundamentals",
  icons: {
    icon: "/balancehublogo.png",
    shortcut: "/balancehublogo.png",
    apple: "/balancehublogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`antialiased`}>
        {/* Ensure theme is applied before hydration to avoid flashes and make toggle predictable */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const stored = localStorage.getItem('theme');
              const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              const theme = stored || (prefersDark ? 'dark' : 'light');
              if (theme === 'dark') document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
              document.documentElement.setAttribute('data-theme', theme);
            } catch (_) {}
          `}
        </Script>
        <Providers>
          <div className="relative min-h-screen bg-background bg-white dark:bg-neutral-950 transition-colors">
            {/* Decorative gradients */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-blob" />
              <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl animate-blob animate-blob-slow animate-blob-delay-1" />
              <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl animate-blob animate-blob-fast animate-blob-delay-2" />
            </div>

            <Navbar />
            <main className="container mx-auto px-4 py-8 relative z-10 bg-transparent">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
