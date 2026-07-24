'use client';

import { useState } from 'react';
import { saveLocalSubscriber } from '@/lib/supabase';
import { Mail, CheckCircle2 } from 'lucide-react';

interface MailingListProps {
  lang: 'he' | 'en';
}

export function MailingList({ lang }: MailingListProps) {
  const isHe = lang === 'he';
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    saveLocalSubscriber(email.trim());
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-tr from-indigo-900/10 via-slate-900/40 to-sky-900/10 relative overflow-hidden">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-2">
          <Mail className="w-6 h-6" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isHe ? 'הירשמו לעדכונים על מאמרים חדשים' : 'Subscribe to New Post Updates'}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isHe
            ? 'קבלו הודעה ישירות לתיבת הדוא"ל בכל פעם שמתפרסם ניתוח מוזיקלי או פרויקט AI חדש.'
            : 'Get notified directly in your inbox whenever a new music analysis or AI write-up is published.'}
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:opacity-95 transition-opacity whitespace-nowrap"
            >
              {isHe ? 'הרשמה' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
