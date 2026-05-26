'use client';

import { useCallback, useState } from 'react';
import { getAppUrl } from '@/lib/app-url';
import { renderStoryImageBlob, type StoryShareMode } from '@/lib/story-image';
import { shareStoryImageBlob } from '@/lib/share-story';
import { track } from '@/lib/analytics';

interface Props {
  categoryLabel: string;
  categoryIcon: string;
  content: string;
  clue?: string | null;
  opened: boolean;
}

export function StoryShare({ categoryLabel, categoryIcon, content, clue, opened }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<StoryShareMode>('teaser');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setBusy(true);
    setStatus(null);
    try {
      const shareMode = opened ? mode : 'teaser';
      const blob = await renderStoryImageBlob({
        mode: shareMode,
        categoryLabel,
        categoryIcon,
        content,
        clue,
        appUrl: getAppUrl(),
      });

      const outcome = await shareStoryImageBlob(blob);
      if (outcome === 'cancelled') return;

      track('story_shared', {
        mode: shareMode,
        method: outcome === 'shared' ? 'native' : 'download',
      });

      setStatus(
        outcome === 'shared'
          ? 'Choose Instagram in the share sheet, then add to your Story.'
          : 'Image saved. Open Instagram → Story → swipe up or add photo → pick traces-story.png.'
      );
    } catch {
      setStatus('Could not create the image. Try again.');
    } finally {
      setBusy(false);
    }
  }, [categoryLabel, categoryIcon, content, clue, mode, opened]);

  return (
    <>
      <button
        type="button"
        className="dash-pill-btn story-share-trigger"
        onClick={() => setOpen(true)}
      >
        Share to Story
      </button>

      {open && (
        <div
          className="story-share-backdrop"
          role="dialog"
          aria-modal
          aria-labelledby="story-share-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="story-share-modal glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="story-share-title" className="story-share-modal__title">
              Share to Story
            </p>
            <p className="story-share-modal__sub">
              Premium 9:16 image with Traces branding and a link back to the app.
            </p>

            {opened ? (
              <div className="story-share-modes" role="radiogroup" aria-label="Share mode">
                <button
                  type="button"
                  className={`story-share-mode${mode === 'teaser' ? ' story-share-mode--on' : ''}`}
                  onClick={() => setMode('teaser')}
                >
                  <span className="story-share-mode__label">Teaser</span>
                  <span className="story-share-mode__desc">Private — no message text</span>
                </button>
                <button
                  type="button"
                  className={`story-share-mode${mode === 'full' ? ' story-share-mode--on' : ''}`}
                  onClick={() => setMode('full')}
                >
                  <span className="story-share-mode__label">Full trace</span>
                  <span className="story-share-mode__desc">Quote excerpt on your Story</span>
                </button>
              </div>
            ) : (
              <p className="story-share-modal__note">
                Open the trace first to share the full message. Teaser mode works now.
              </p>
            )}

            <button
              type="button"
              className="story-share-cta"
              disabled={busy}
              onClick={() => void generate()}
            >
              {busy ? 'Creating…' : 'Create & share'}
            </button>

            {status && <p className="story-share-status">{status}</p>}

            <button type="button" className="story-share-dismiss" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
