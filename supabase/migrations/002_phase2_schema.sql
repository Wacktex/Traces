-- Phase 2: optional emotional tone on traces (sender intent, not shown to receiver by default)
alter table public.traces
  add column if not exists emotional_tone text;

comment on column public.traces.emotional_tone is 'Sender-selected tone: warm, sincere, playful, gentle, bold, neutral';
