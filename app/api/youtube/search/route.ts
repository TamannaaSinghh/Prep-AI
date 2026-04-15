import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  channel: string;
  channelId: string;
  thumbnail: string;
  publishedAt: string;
  durationSeconds: number;
}

// How many results to take from the final (non-Shorts) list.
const PICK_COUNT = 3;
// Number of candidates to request from YouTube so we still have >= PICK_COUNT
// after Shorts are filtered out.
const SEARCH_CANDIDATES = 15;
// Videos shorter than this are treated as Shorts (YouTube's official Shorts
// cap is 60s, recently up to 3min). 120s is the safe middle ground.
const MIN_DURATION_SECONDS = 120;

// ─── In-memory cache ───────────────────────────────────────────────────
const CACHE = new Map<string, { expiresAt: number; videos: YouTubeVideo[] }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function cacheGet(key: string): YouTubeVideo[] | null {
  const hit = CACHE.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    CACHE.delete(key);
    return null;
  }
  return hit.videos;
}

function cacheSet(key: string, videos: YouTubeVideo[]) {
  CACHE.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, videos });
}

function buildQuery(params: {
  domain?: string;
  topic?: string;
  subtopic?: string;
}): string {
  const parts = [params.domain, params.topic, params.subtopic]
    .map((p) => p?.trim())
    .filter(Boolean) as string[];
  const base = parts.join(' ');
  if (!base) return '';
  return `${base} tutorial`;
}

/**
 * Parses YouTube's ISO-8601 duration string (e.g. "PT1H2M3S") into seconds.
 * Handles H, M, S components, any of which may be absent.
 */
function parseDurationSeconds(iso: string): number {
  if (!iso) return 0;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return 0;
  const h = parseInt(m[1] ?? '0', 10);
  const mi = parseInt(m[2] ?? '0', 10);
  const s = parseInt(m[3] ?? '0', 10);
  return h * 3600 + mi * 60 + s;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'YouTube API key not configured.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') ?? undefined;
  const topic = searchParams.get('topic') ?? undefined;
  const subtopic = searchParams.get('subtopic') ?? undefined;

  const q = buildQuery({ domain, topic, subtopic });
  if (!q) {
    return NextResponse.json(
      { error: 'Provide at least one of domain, topic, or subtopic.' },
      { status: 400 }
    );
  }

  const cacheKey = q.toLowerCase();
  const cached = cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json({ videos: cached, cached: true });
  }

  try {
    // ── 1. search.list — get candidate video IDs + snippet ─────────────
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('q', q);
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('videoEmbeddable', 'true');
    searchUrl.searchParams.set('videoDefinition', 'high');
    // `medium` = 4–20 min, `long` = 20+. Using `medium` biases results toward
    // real tutorials and also excludes Shorts (which are all < 4 min) before
    // we even hit the duration filter — saving us noise and extra quota work.
    searchUrl.searchParams.set('videoDuration', 'medium');
    searchUrl.searchParams.set('relevanceLanguage', 'en');
    searchUrl.searchParams.set('safeSearch', 'strict');
    searchUrl.searchParams.set('maxResults', String(SEARCH_CANDIDATES));

    const searchRes = await fetch(searchUrl.toString(), { cache: 'no-store' });
    if (!searchRes.ok) {
      const body = await searchRes.text();
      console.error('YouTube search API error:', searchRes.status, body);
      if (searchRes.status === 403) {
        return NextResponse.json(
          { error: 'YouTube quota exceeded or key invalid.' },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: 'YouTube search failed.' },
        { status: 502 }
      );
    }

    const searchData = await searchRes.json();
    const items: any[] = searchData?.items ?? [];
    if (items.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    // Map preserves YouTube's relevance order.
    const candidates = items
      .map((it) => ({
        videoId: it.id?.videoId as string | undefined,
        snippet: it.snippet ?? {},
      }))
      .filter((c): c is { videoId: string; snippet: any } => !!c.videoId);

    if (candidates.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    // ── 2. videos.list — fetch durations for Shorts filtering ──────────
    const ids = candidates.map((c) => c.videoId).join(',');
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.set('key', apiKey);
    videosUrl.searchParams.set('part', 'contentDetails');
    videosUrl.searchParams.set('id', ids);

    const videosRes = await fetch(videosUrl.toString(), { cache: 'no-store' });
    const durationById = new Map<string, number>();
    if (videosRes.ok) {
      const videosData = await videosRes.json();
      for (const v of videosData?.items ?? []) {
        const id = v.id as string;
        const iso = v.contentDetails?.duration as string;
        durationById.set(id, parseDurationSeconds(iso));
      }
    }
    // If videos.list fails for some reason, we still proceed — the
    // `videoDuration=medium` filter on search.list already excludes Shorts,
    // so duration is a belt-and-braces safeguard.

    // ── 3. Build the output list ───────────────────────────────────────
    const videos: YouTubeVideo[] = [];
    for (const c of candidates) {
      const dur = durationById.get(c.videoId) ?? 0;
      // If we have a duration and it's Shorts-like, drop it.
      if (dur > 0 && dur < MIN_DURATION_SECONDS) continue;

      const s = c.snippet;
      const thumbnail =
        s.thumbnails?.maxres?.url ??
        s.thumbnails?.high?.url ??
        s.thumbnails?.medium?.url ??
        `https://i.ytimg.com/vi/${c.videoId}/hqdefault.jpg`;

      videos.push({
        videoId: c.videoId,
        title: s.title ?? '',
        description: s.description ?? '',
        channel: s.channelTitle ?? '',
        channelId: s.channelId ?? '',
        thumbnail,
        publishedAt: s.publishedAt ?? '',
        durationSeconds: dur,
      });

      if (videos.length >= PICK_COUNT) break;
    }

    cacheSet(cacheKey, videos);
    return NextResponse.json({ videos, cached: false });
  } catch (error: any) {
    console.error('YouTube fetch error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to reach YouTube.' },
      { status: 502 }
    );
  }
}
