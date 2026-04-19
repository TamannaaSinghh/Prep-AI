'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, ExternalLink, Loader2 } from 'lucide-react';

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description: string;
  channel: string;
  channelId: string;
  thumbnail: string;
  publishedAt: string;
  durationSeconds?: number;
}

interface YouTubeRecommendationProps {
  videos: YouTubeVideoData[];
  loading?: boolean;
}

// YouTube wordmark icon — lucide's Youtube export isn't available in v1.7.x,
// so we inline the official rounded-rect play shape instead.
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}

function formatPublishedDate(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Shows up to 3 recommended YouTube videos with a main player + thumbnail
 * selector. Clicking a thumbnail switches which video fills the main player.
 * Uses click-to-play pattern so the heavy YouTube iframe only loads when the
 * user actually hits play on the main player.
 */
export function YouTubeRecommendation({
  videos,
  loading,
}: YouTubeRecommendationProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Reset selection whenever the list of videos changes (new topic loaded).
  useEffect(() => {
    setActiveIndex(0);
    setPlaying(false);
  }, [videos]);

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-accent/30">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-red-500/15 flex items-center justify-center">
                <YouTubeIcon className="h-3.5 w-3.5 text-red-500" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Top videos for this topic
              </p>
            </div>
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-[480px] md:shrink-0 aspect-video bg-muted animate-pulse" />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-1.5 p-1.5 md:p-2 bg-muted/30 border-t md:border-t-0 md:border-l">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-2 p-1">
                  <div className="aspect-video w-full md:w-40 shrink-0 rounded bg-muted animate-pulse" />
                  <div className="hidden md:block flex-1 py-0.5 space-y-1">
                    <div className="h-2.5 w-full rounded bg-muted animate-pulse" />
                    <div className="h-2.5 w-2/3 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t px-4 py-2.5 space-y-1">
            <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-1/3 rounded bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!videos || videos.length === 0) return null;

  const active = videos[activeIndex] ?? videos[0];
  const publishedLabel = formatPublishedDate(active.publishedAt);
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${active.videoId}`;

  function selectVideo(i: number) {
    if (i === activeIndex) return;
    setActiveIndex(i);
    setPlaying(false); // reset to thumbnail view of the newly selected video
  }

  // "Up next" — every video that isn't currently the main one.
  const others = videos
    .map((v, i) => ({ video: v, index: i }))
    .filter((x) => x.index !== activeIndex);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-b bg-card">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-md bg-red-500/15 flex items-center justify-center shrink-0">
              <YouTubeIcon className="h-3.5 w-3.5 text-red-500" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
              Top {videos.length} videos · pick one
            </p>
          </div>
          <Badge
            variant="secondary"
            className="hidden sm:inline-flex bg-accent text-primary shrink-0 text-[10px] px-2 py-0"
          >
            Recommended
          </Badge>
        </div>

        {/* Body: main player + "up next" sidebar */}
        <div className="flex flex-col md:flex-row">
          {/* ── Main 16:9 Player / Thumbnail (left — fixed width to lock height) ── */}
          <div className="relative md:w-[480px] aspect-video bg-black shrink-0">
            {playing ? (
              <iframe
                key={active.videoId}
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${active.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="group relative block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                aria-label={`Play video: ${active.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.thumbnail}
                  alt={active.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-soft-lg transition-transform group-hover:scale-110">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>
                {active.durationSeconds ? (
                  <div className="absolute bottom-2 right-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                      {formatDuration(active.durationSeconds)}
                    </span>
                  </div>
                ) : null}
              </button>
            )}
          </div>

          {/* ── Up next sidebar (right / below on mobile) ── */}
          {others.length > 0 && (
            <div className="flex-1 min-w-0 bg-muted/30 border-t md:border-t-0 md:border-l flex flex-col">
              <p className="hidden md:block px-3 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Up next
              </p>
              <div className="grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-1.5 p-1.5 md:p-2 md:flex-1">
                {others.map(({ video: v, index: i }) => (
                  <button
                    key={v.videoId}
                    type="button"
                    onClick={() => selectVideo(i)}
                    className="group flex gap-2 md:gap-3 rounded-md overflow-hidden border border-transparent hover:border-primary/40 hover:bg-card transition-all ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-left p-1"
                    aria-label={`Select video: ${v.title}`}
                    title={v.title}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full md:w-40 shrink-0 rounded overflow-hidden bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      {v.durationSeconds ? (
                        <div className="absolute bottom-0.5 right-0.5">
                          <span className="inline-flex items-center rounded bg-black/75 px-1 py-[1px] text-[9px] font-semibold text-white tabular-nums">
                            {formatDuration(v.durationSeconds)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Title + channel (desktop only — mobile shows thumbs-only row) */}
                    <div className="hidden md:block min-w-0 flex-1 py-0.5">
                      <p
                        className="text-[12px] leading-snug line-clamp-2 font-medium text-foreground group-hover:text-primary"
                        title={v.title}
                      >
                        {v.title}
                      </p>
                      <p
                        className="text-[10px] text-muted-foreground truncate mt-1"
                        title={v.channel}
                      >
                        {v.channel}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active video metadata (full width, under player + sidebar) */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-3 border-t min-w-0">
          <div className="min-w-0 flex-1">
            <h3
              className="font-semibold text-xs leading-snug line-clamp-1"
              title={active.title}
            >
              {active.title}
            </h3>
            <p
              className="text-[10px] text-muted-foreground truncate"
              title={active.channel}
            >
              {active.channel}
              {publishedLabel && <span> · {publishedLabel}</span>}
            </p>
          </div>
          <a
            href={youtubeWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline shrink-0"
          >
            YouTube
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
