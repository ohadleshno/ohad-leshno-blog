import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans text-center">
      <div className="max-w-lg w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900">
            404 Error • העמוד לא נמצא
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 pt-2">
            הגעת לעמוד שלא קיים
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-light leading-relaxed pt-1">
            הקישור שחיפשת עבר מקום או אינו זמין עוד. באפשרותך לחזור לעמוד הבית או לעיין במאמרים ובפרויקטים.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            href="/he"
            className="px-5 py-3 rounded-xl text-xs sm:text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
          >
            עמוד הבית (עברית)
          </Link>
          <Link
            href="/en"
            className="px-5 py-3 rounded-xl text-xs sm:text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Homepage (English)
          </Link>
        </div>

        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          <p className="font-semibold text-neutral-700 dark:text-neutral-300">קישורים מומלצים:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/he/music" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors underline underline-offset-4">
              מאמרי מוזיקה
            </Link>
            <Link href="/he/tech" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors underline underline-offset-4">
              פרויקטי AI
            </Link>
            <Link href="/he/about" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors underline underline-offset-4">
              אודות
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
