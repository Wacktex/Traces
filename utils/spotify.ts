// ================================================================
// TRACES — Song Preview Utility
// utils/spotify.ts
//
// Resolves a Spotify track URL to a preview card data object
// using the oEmbed API (no auth required).
// ================================================================

export interface SongPreview {
  title: string;
  artist: string;
  albumArt: string | null;
  spotifyUrl: string;
  embedUrl: string | null;
}

// Validate that a URL is a Spotify track link
export function isSpotifyTrackUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === 'open.spotify.com' || parsed.hostname === 'spotify.com') &&
      parsed.pathname.startsWith('/track/')
    );
  } catch {
    return false;
  }
}

// Extract track ID from Spotify URL
export function extractSpotifyTrackId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/track\/([a-zA-Z0-9]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

// Fetch song metadata via Spotify oEmbed (public, no auth)
export async function fetchSongPreview(url: string): Promise<SongPreview | null> {
  if (!isSpotifyTrackUrl(url)) return null;

  const trackId = extractSpotifyTrackId(url);
  if (!trackId) return null;

  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!res.ok) return null;

    const data = await res.json();

    // Parse artist from title (format: "Track Name by Artist Name")
    const parts = (data.title as string).split(' by ');
    const title = parts[0] ?? data.title;
    const artist = parts[1] ?? 'Unknown artist';

    return {
      title,
      artist,
      albumArt: data.thumbnail_url ?? null,
      spotifyUrl: url,
      embedUrl: `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`,
    };
  } catch {
    // oEmbed unavailable — return minimal fallback
    return {
      title: 'Spotify Track',
      artist: 'Open in Spotify',
      albumArt: null,
      spotifyUrl: url,
      embedUrl: null,
    };
  }
}
