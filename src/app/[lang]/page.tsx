export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export default function HomePage({ params }: { params: { lang: 'he' | 'en' } }) {
  const isHe = params.lang === 'he';

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        {isHe ? 'ברוכים הבאים לבלוג של אוהד לשנו' : 'Welcome to Ohad Leshno Blog'}
      </h1>
      <p className="text-slate-600 dark:text-slate-300">
        {isHe
          ? 'בלוג מוזיקה, תרבות ופיתוח AI'
          : 'Music analysis, culture, and AI engineering write-ups.'}
      </p>
    </div>
  );
}
