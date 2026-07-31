'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { recordPageAnalytics } from '@/lib/supabase';

export function PageAnalyticsTracker() {
  const pathname = usePathname();
  const currentPathRef = useRef<string>(pathname);
  const activeStartTimeRef = useRef<number>(Date.now());
  const accumulatedActiveMsRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(typeof document !== 'undefined' ? document.visibilityState === 'visible' : true);

  const extractPathDetails = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    const locale = parts[0] === 'en' ? 'en' : 'he';
    let postSlug: string | undefined = undefined;

    if ((parts[1] === 'tech' || parts[1] === 'music') && parts[2]) {
      postSlug = parts[2];
    }
    return { locale, postSlug };
  };

  const flushDwellTime = (path: string) => {
    let currentMs = accumulatedActiveMsRef.current;
    if (isVisibleRef.current) {
      currentMs += Date.now() - activeStartTimeRef.current;
    }

    const durationSeconds = Math.round(currentMs / 1000);

    // Only record meaningful page dwell time (more than 2 seconds)
    if (durationSeconds >= 2) {
      const { locale, postSlug } = extractPathDetails(path);
      recordPageAnalytics({
        path,
        postSlug,
        locale,
        durationSeconds,
      });
    }

    // Reset accumulated counters
    accumulatedActiveMsRef.current = 0;
    activeStartTimeRef.current = Date.now();
  };

  // 1. Path Change Listener
  useEffect(() => {
    if (currentPathRef.current !== pathname) {
      flushDwellTime(currentPathRef.current);
      currentPathRef.current = pathname;
      activeStartTimeRef.current = Date.now();
      accumulatedActiveMsRef.current = 0;
    }
  }, [pathname]);

  // 2. Visibility & Unload Listeners + Periodic Heartbeat
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isVisibleRef.current) {
          accumulatedActiveMsRef.current += Date.now() - activeStartTimeRef.current;
          isVisibleRef.current = false;
          flushDwellTime(currentPathRef.current);
        }
      } else {
        if (!isVisibleRef.current) {
          activeStartTimeRef.current = Date.now();
          isVisibleRef.current = true;
        }
      }
    };

    const handleBeforeUnload = () => {
      flushDwellTime(currentPathRef.current);
    };

    // Periodic heartbeat flush every 15 seconds
    const intervalId = setInterval(() => {
      if (isVisibleRef.current) {
        flushDwellTime(currentPathRef.current);
      }
    }, 15000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushDwellTime(currentPathRef.current);
    };
  }, []);

  return null;
}
