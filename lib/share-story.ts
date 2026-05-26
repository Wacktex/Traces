/** Share or save a story PNG — mobile-first (iOS/Android share sheet + download fallback). */
export async function shareStoryImageBlob(
  blob: Blob
): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], 'traces-story.png', { type: 'image/png' });

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        files: [file],
        title: 'Traces',
      });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
      // Some browsers reject files but accept falling through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'traces-story.png';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return 'downloaded';
}
