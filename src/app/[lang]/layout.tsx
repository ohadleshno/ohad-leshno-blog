import type { Metadata } from 'next';
import '../globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageAnalyticsTracker } from '@/components/PageAnalyticsTracker';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export function generateMetadata({ params }: { params: { lang: 'he' | 'en' } }): Metadata {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';

  const title = isHe
    ? 'אוהד לשנו | מוזיקה • תרבות • הנדסת AI'
    : 'Ohad Leshno | Music • Culture • AI Engineering';
  const description = isHe
    ? 'הבלוג של אוהד לשנו - ניתוח מוזיקלי ותרבותי לצד מחקר והנדסת מערכות בינה מלאכותית (AI).'
    : 'Ohad Leshno’s Blog - Music, culture, and AI engineering. Deep musical analysis meets AI systems research.';

  return {
    title: {
      default: title,
      template: isHe ? '%s | אוהד לשנו' : '%s | Ohad Leshno',
    },
    description,
    alternates: {
      canonical: `https://ohadleshno.com/${lang}`,
      languages: {
        he: 'https://ohadleshno.com/he',
        en: 'https://ohadleshno.com/en',
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/logo.webp', type: 'image/png' },
      ],
      shortcut: '/logo.webp',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title,
      description,
      url: `https://ohadleshno.com/${lang}`,
      siteName: 'Ohad Leshno Blog',
      locale: isHe ? 'he_IL' : 'en_US',
      type: 'website',
      images: [
        {
          url: 'https://ohadleshno.com/ohad_leshno.webp',
          width: 800,
          height: 800,
          alt: 'Ohad Leshno',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://ohadleshno.com/ohad_leshno.webp'],
    },
  };
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: 'he' | 'en' };
}) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';

  return (
    <div dir={isHe ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <PageAnalyticsTracker />
        <Header lang={lang} />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer lang={lang} />
      </ThemeProvider>
    </div>
  );
}

