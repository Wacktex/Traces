/** Instagram Story canvas — 9:16 @ 1080px wide. */
export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

export type StoryShareMode = 'full' | 'teaser';

export interface StoryImageInput {
  mode: StoryShareMode;
  categoryLabel: string;
  categoryIcon: string;
  content: string;
  clue?: string | null;
  appUrl: string;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0B0B0C';
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  const warm = ctx.createRadialGradient(STORY_WIDTH / 2, STORY_HEIGHT * 0.12, 0, STORY_WIDTH / 2, STORY_HEIGHT * 0.2, STORY_WIDTH * 0.9);
  warm.addColorStop(0, 'rgba(61, 92, 74, 0.35)');
  warm.addColorStop(0.55, 'rgba(11, 11, 12, 0)');
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  const cream = ctx.createRadialGradient(STORY_WIDTH * 0.85, STORY_HEIGHT * 0.35, 0, STORY_WIDTH * 0.85, STORY_HEIGHT * 0.35, STORY_WIDTH * 0.5);
  cream.addColorStop(0, 'rgba(200, 191, 170, 0.08)');
  cream.addColorStop(1, 'rgba(11, 11, 12, 0)');
  ctx.fillStyle = cream;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);
}

function drawGlassCard(ctx: CanvasRenderingContext2D, y: number, h: number) {
  roundRect(ctx, 72, y, STORY_WIDTH - 144, h, 36);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.055)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 191, 170, 0.22)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  roundRect(ctx, 88, y + 14, STORY_WIDTH - 176, h - 28, 28);
  ctx.stroke();
}

/** Renders a story PNG blob (client-only). */
export async function renderStoryImageBlob(input: StoryImageInput): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  drawBackground(ctx);

  const cardY = 520;
  const cardH = 920;
  drawGlassCard(ctx, cardY, cardH);

  ctx.textAlign = 'center';

  ctx.font = '500 32px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#6b8f78';
  const eyebrow = `${input.categoryIcon}  ${input.categoryLabel.toUpperCase()}`;
  ctx.fillText(eyebrow, STORY_WIDTH / 2, cardY + 100);

  const host = input.appUrl.replace(/^https?:\/\//, '');
  const maxTextWidth = STORY_WIDTH - 220;

  if (input.mode === 'teaser') {
    ctx.font = 'italic 52px Georgia, "Cormorant Garamond", serif';
    ctx.fillStyle = '#d4c9b0';
    const teaserLines = wrapLines(
      ctx,
      'Someone left me an anonymous trace.',
      maxTextWidth
    );
    let ty = cardY + 200;
    for (const ln of teaserLines) {
      ctx.fillText(ln, STORY_WIDTH / 2, ty);
      ty += 68;
    }

    ctx.font = '400 36px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#8a8580';
    ctx.fillText('The words stay private — only the moment is shared.', STORY_WIDTH / 2, ty + 40);

    for (let i = 0; i < 5; i++) {
      const by = cardY + 380 + i * 52;
      roundRect(ctx, 140, by, STORY_WIDTH - 280, 36, 18);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fill();
    }
  } else {
    const excerpt = input.content.length > 420 ? `${input.content.slice(0, 417)}…` : input.content;
    ctx.font = 'italic 48px Georgia, "Cormorant Garamond", serif';
    ctx.fillStyle = '#f0ece4';
    const lines = wrapLines(ctx, `"${excerpt}"`, maxTextWidth);
    let ty = cardY + 200;
    for (const ln of lines.slice(0, 9)) {
      ctx.fillText(ln, STORY_WIDTH / 2, ty);
      ty += 62;
    }

    if (input.clue) {
      ctx.font = 'italic 34px Georgia, serif';
      ctx.fillStyle = '#9a9490';
      const clueLines = wrapLines(ctx, `— ${input.clue}`, maxTextWidth);
      ty += 24;
      for (const ln of clueLines.slice(0, 2)) {
        ctx.fillText(ln, STORY_WIDTH / 2, ty);
        ty += 48;
      }
    }
  }

  ctx.font = '300 72px Georgia, "Cormorant Garamond", serif';
  ctx.fillStyle = '#f0ece4';
  ctx.fillText('traces', STORY_WIDTH / 2, STORY_HEIGHT - 340);

  ctx.font = '500 34px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#c8bfaa';
  ctx.fillText('Leave a trace', STORY_WIDTH / 2, STORY_HEIGHT - 260);

  roundRect(ctx, STORY_WIDTH / 2 - 280, STORY_HEIGHT - 220, 560, 72, 36);
  ctx.fillStyle = 'rgba(45, 74, 62, 0.55)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 191, 170, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '600 30px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#f0ece4';
  ctx.fillText(host, STORY_WIDTH / 2, STORY_HEIGHT - 172);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png', 0.92);
  });
  if (!blob) throw new Error('Could not create image');
  return blob;
}
