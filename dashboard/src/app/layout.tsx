import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Palmer Penguins | The Three Tribes',
  description: 'Interactive data exploration of the Palmer Penguins dataset in 5 Acts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} dashboard-body min-h-screen antialiased`}>
        <Script id="init-dashboard-theme" strategy="beforeInteractive">
          {`
            try {
              var storedTheme = window.localStorage.getItem('palmer-dashboard-theme');
              var theme = storedTheme === 'light' ? 'light' : 'dark';
              document.documentElement.classList.toggle('dark', theme === 'dark');
            } catch (error) {
              document.documentElement.classList.add('dark');
            }
          `}
        </Script>
        <div className="flex flex-col min-h-screen">
          <header className="dashboard-header sticky top-0 z-50 flex items-center justify-between gap-6 border-b px-6 py-4 backdrop-blur-xl md:px-8 md:py-5">
            <div className="flex items-center gap-5">
              <div className="dashboard-surface rounded-xl border p-3">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="dashboard-text-strong bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
                  The Three Tribes
                </h1>
                <p className="dashboard-text-soft mt-0.5 text-xs font-medium tracking-wide uppercase">
                  Palmer Archipelago, Antarctica
                </p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-x-hidden w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
