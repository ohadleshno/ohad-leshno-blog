import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'אוהד לשנו | מוזיקה • תרבות • הנדסת AI',
  description: 'הבלוג של אוהד לשנו - מוזיקה, תרבות, והנדסת בינה מלאכותית (AI). חוקר מוזיקה, כותב ומפתח AI.',
  alternates: {
    canonical: 'https://ohadleshno.com/he',
    languages: {
      he: 'https://ohadleshno.com/he',
      en: 'https://ohadleshno.com/en',
      'x-default': 'https://ohadleshno.com/he',
    },
  },
  openGraph: {
    title: 'אוהד לשנו | מוזיקה • תרבות • הנדסת AI',
    description: 'הבלוג של אוהד לשנו - מוזיקה, תרבות, והנדסת בינה מלאכותית (AI).',
    url: 'https://ohadleshno.com',
    siteName: 'Ohad Leshno Blog',
    locale: 'he_IL',
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
    title: 'אוהד לשנו | מוזיקה • תרבות • הנדסת AI',
    description: 'הבלוג של אוהד לשנו - מוזיקה, תרבות, והנדסת בינה מלאכותית (AI).',
    images: ['https://ohadleshno.com/ohad_leshno.webp'],
  },
};

export default function RootPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 dir-rtl text-right">
      <head>
        <meta httpEquiv="refresh" content="0;url=/he" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if (typeof window !== 'undefined') { window.location.replace('/he'); }`,
          }}
        />
      </head>

      <div className="max-w-xl w-full space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          אוהד לשנו | הבלוג
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          חוקר מוזיקה, כותב ומפתח AI. מקום שבו ניתוח מוזיקלי ותרבותי פוגש מחקר טכנולוגי והנדסת מערכות בינה מלאכותית.
        </p>

        <nav aria-label="Language selection" className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/he"
            className="px-6 py-3 rounded-lg font-medium text-sm bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors"
          >
            כניסה לבלוג בעברית (Hebrew)
          </Link>
          <Link
            href="/en"
            className="px-6 py-3 rounded-lg font-medium text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            English Version
          </Link>
        </nav>

        <ul className="text-sm text-slate-500 space-y-2 pt-6 border-t border-slate-200 dark:border-slate-800">
          <li><Link href="/he/music" className="hover:underline">מאמרי מוזיקה ותרבות</Link></li>
          <li><Link href="/he/tech" className="hover:underline">פרויקטי AI ומחקר טכנולוגי</Link></li>
          <li><Link href="/he/about" className="hover:underline">אודות אוהד לשנו</Link></li>
        </ul>
      </div>
    </main>
  );
}
