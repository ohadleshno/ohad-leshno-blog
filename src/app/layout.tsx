import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ohadleshno.com'),
  title: {
    default: 'אוהד לשנו | מוזיקה • תרבות • הנדסת AI',
    template: '%s | אוהד לשנו',
  },
  description: 'הבלוג של אוהד לשנו - מוזיקה, תרבות, והנדסת בינה מלאכותית (AI). מחקר מוזיקלי ותרבותי לצד הנדסת מערכות בינה מלאכותית.',
  keywords: ['אוהד לשנו', 'Ohad Leshno', 'בלוג מוזיקה ותרבות', 'הנדסת AI', 'מערכות בינה מלאכותית', 'תרבות', 'מוזיקה ישראלית', 'AI Engineering Blog', 'Music Analysis'],
  authors: [{ name: 'Ohad Leshno', url: 'https://ohadleshno.com' }],
  creator: 'Ohad Leshno',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo-icon.webp', type: 'image/webp' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'אוהד לשנו | מוזיקה • תרבות • הנדסת AI',
    description: 'הבלוג של אוהד לשנו - מוזיקה, תרבות, והנדסת בינה מלאכותית (AI).',
    url: 'https://ohadleshno.com',
    siteName: 'Ohad Leshno Blog',
    images: [
      {
        url: '/ohad_leshno.webp',
        width: 800,
        height: 800,
        alt: 'Ohad Leshno',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'אוהד לשנו | מוזיקה • תרבות • הנדסת AI',
    description: 'הבלוג של אוהד לשנו - מוזיקה, תרבות, והנדסת בינה מלאכותית (AI).',
    images: ['/ohad_leshno.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}




