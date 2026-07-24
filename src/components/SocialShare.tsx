'use client';

import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  title: string;
  url: string;
  isHe: boolean;
}

export function SocialShare({ title, url, isHe }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);

  return (
    <div className="flex items-center gap-3 py-4 border-y border-slate-200 dark:border-slate-800 my-8">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <Share2 className="w-4 h-4" />
        {isHe ? 'שיתוף:' : 'Share:'}
      </span>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
      >
        WhatsApp
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 transition-colors"
      >
        Twitter
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            {isHe ? 'הועתק!' : 'Copied!'}
          </>
        ) : (
          <>
            <LinkIcon className="w-3.5 h-3.5" />
            {isHe ? 'העתקת קישור' : 'Copy Link'}
          </>
        )}
      </button>
    </div>
  );
}
