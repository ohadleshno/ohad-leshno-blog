'use client';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

export function YouTubeEmbed({ url, title = 'YouTube Video' }: YouTubeEmbedProps) {
  // Extract video ID from YouTube URL
  let videoId = '';
  try {
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/')[1];
      videoId = parts.split('?')[0];
    } else if (url.includes('youtube.com/watch')) {
      const searchParams = new URL(url).searchParams;
      videoId = searchParams.get('v') || '';
    }
  } catch (e) {
    videoId = '';
  }

  if (!videoId) {
    return (
      <div className="my-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm">
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500">
          🎥 Watch Video: {title}
        </a>
      </div>
    );
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

  return (
    <div className="my-8 overflow-hidden rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 bg-black">
      <div className="relative w-full pb-[56.25%]">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
}
