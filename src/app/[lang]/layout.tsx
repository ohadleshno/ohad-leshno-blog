import '../globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: 'he' | 'en' };
}) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';

  return (
    <html lang={lang} dir={isHe ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Header lang={lang} />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer lang={lang} />
        </ThemeProvider>
      </body>
    </html>
  );
}
