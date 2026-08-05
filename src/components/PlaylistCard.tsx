import React from 'react';
import Link from 'next/link';
import { getTechSeriesProjects } from '@/lib/tech';
import { BookOpen } from 'lucide-react';

interface PlaylistCardProps {
  seriesId: string;
  seriesTitle?: string;
  lang: 'he' | 'en';
}

export function PlaylistCard({ seriesId, seriesTitle, lang }: PlaylistCardProps) {
  const isHe = lang === 'he';
  const posts = getTechSeriesProjects(seriesId, lang, true);

  if (!posts || posts.length === 0) return null;

  const title = seriesTitle || posts[0]?.seriesTitle || (isHe ? 'סדרת מאמרים' : 'Article Series');
  const coverImage = posts[0]?.coverImage || '/hero-cover.webp';
  const playlistUrl = `/${lang}/tech/series/${seriesId}`;

  return (
    <div className="group relative max-w-sm flex flex-col space-y-3">
      {/* YouTube Stacked Card Visual Effect */}
      <div className="relative pt-3 px-2">
        {/* Layer 3 (Bottom Stacked Card) */}
        <div className="absolute top-0 left-6 right-6 h-4 rounded-t-xl bg-neutral-300 dark:bg-neutral-800 opacity-60 transition-transform group-hover:-translate-y-1 duration-300" />

        {/* Layer 2 (Middle Stacked Card) */}
        <div className="absolute top-1.5 left-4 right-4 h-4 rounded-t-xl bg-neutral-400 dark:bg-neutral-700 opacity-80 transition-transform group-hover:-translate-y-0.5 duration-300" />

        {/* Layer 1 (Main Top Image Container) */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-900 shadow-md border border-neutral-200/80 dark:border-neutral-800">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          />

          {/* YouTube-style Badge on Lower Right */}
          <div className="absolute bottom-3 right-3 bg-black/85 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-white/10 z-10" dir="ltr">
            <BookOpen className="size-3.5" />
            <span>{posts.length} {isHe ? 'מאמרים' : posts.length === 1 ? 'post' : 'posts'}</span>
          </div>

          {/* Dark Overlay Gradient on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Full Card Overlay Link */}
        <Link
          href={playlistUrl}
          className="absolute inset-0 z-20"
          aria-label={title}
        />
      </div>

      {/* Playlist Meta Details */}
      <div className="space-y-1 px-1">
        <h3 className="font-display text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
          {title}
        </h3>

        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          {isHe ? 'עודכן היום' : 'Updated today'}
        </div>

        <Link
          href={playlistUrl}
          className="inline-block pt-1 text-xs font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors uppercase tracking-wider"
        >
          {isHe ? 'לצפייה בכל המאמרים בנושא' : 'View full subject'}
        </Link>
      </div>
    </div>
  );
}
