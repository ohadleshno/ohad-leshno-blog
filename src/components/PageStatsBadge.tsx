'use client';

import { useEffect, useState } from 'react';
import { fetchPageAnalyticsSummary, AnalyticsSummary } from '@/lib/supabase';
import { Clock, Eye } from 'lucide-react';

interface PageStatsBadgeProps {
  postSlug: string;
  lang: 'he' | 'en';
}

export function PageStatsBadge({ postSlug, lang }: PageStatsBadgeProps) {
  const isHe = lang === 'he';
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchPageAnalyticsSummary(postSlug, lang).then((data) => {
      if (isMounted) {
        setStats(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [postSlug, lang]);

  if (!stats || stats.totalViews === 0) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} ${isHe ? 'שניות' : 'sec'}`;
    }
    const minutes = Math.floor(seconds / 60);
    const remSeconds = seconds % 60;
    if (remSeconds === 0) {
      return `${minutes} ${isHe ? 'דקות' : 'min'}`;
    }
    return `${minutes}m ${remSeconds}s`;
  };

  return (
    <div className="inline-flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
      <span className="inline-flex items-center gap-1">
        <Eye className="size-3.5 text-neutral-400 dark:text-neutral-500" />
        {stats.totalViews} {isHe ? 'צפיות' : 'views'}
      </span>

      {stats.avgDurationSeconds > 0 && (
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5 text-neutral-400 dark:text-neutral-500" />
          {isHe ? 'שהייה ממוצעת:' : 'Avg time:'} {formatDuration(stats.avgDurationSeconds)}
        </span>
      )}
    </div>
  );
}
