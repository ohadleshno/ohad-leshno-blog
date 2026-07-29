'use client';

import { useState } from 'react';
import { saveSubscriber } from '@/lib/supabase';
import { Mail, CheckCircle2 } from 'lucide-react';

interface MailingListProps {
  lang: 'he' | 'en';
}

export function MailingList({ lang }: MailingListProps) {
  const isHe = lang === 'he';
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    await saveSubscriber(email.trim());
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="p-8 sm:p-12 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm relative overflow-hidden">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <h3 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">
          {isHe ? 'הירשמו לעדכונים על מאמרים חדשים' : 'Subscribe to New Post Updates'}
        </h3>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {isHe
            ? 'קבלו הודעה ישירות לתיבת הדוא"ל בכל פעם שמתפרסם ניתוח מוזיקלי או פרויקט AI חדש.'
            : 'Get notified directly in your inbox whenever a new music analysis or AI write-up is published.'}
        </p>

        {submitted ? (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {isHe ? 'תודה רבה! הרשמתך התקבלה בהצלחה.' : 'Thank you! You are now subscribed.'}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isHe ? 'כתובת דוא"ל' : 'Enter your email'}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium text-sm bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors whitespace-nowrap"
            >
              {isHe ? 'הרשמה' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
