-- ================================================================
-- TRACES — Seed Data (Development Only)
-- ================================================================

-- Create demo user (matches Clerk test account)
insert into public.users (clerk_id, username, bio, is_onboarded)
values
  ('user_demo_alex',    'alexmonroe',   'designer. night owl. trying to be honest.', true),
  ('user_demo_morgan',  'morganlee',    'always in transit.', true),
  ('user_demo_river',   'river',        'ask me anything except that.', true)
on conflict do nothing;

-- Create some demo traces (delivered)
with users as (select id, username from public.users)
insert into public.traces (receiver_id, content, category, reveal_type, status, clue)
select
  u.id,
  'You seem quieter when things aren''t okay. I hope someone remembers to ask.',
  'midnight_thought',
  'ghost',
  'delivered',
  null
from users u where u.username = 'alexmonroe'
union all
select
  u.id,
  'Motion Sickness — Phoebe Bridgers. This reminded me of you in a way I can''t fully explain.',
  'song_reminder',
  'echo',
  'delivered',
  'Someone from your Tuesday seminar.'
from users u where u.username = 'alexmonroe'
union all
select
  u.id,
  'You seemed like someone who reads the last page first.',
  'first_impression',
  'ghost',
  'delivered',
  null
from users u where u.username = 'alexmonroe'
on conflict do nothing;

-- Create a scheduled capsule
with trace_insert as (
  insert into public.traces (receiver_id, content, category, reveal_type, status, scheduled_time)
  select
    u.id,
    'I hope by the time you read this, you''ve stopped apologizing for taking up space.',
    'confession',
    'ghost',
    'scheduled',
    now() + interval '30 days'
  from public.users u where u.username = 'alexmonroe'
  returning id
)
insert into public.time_capsules (trace_id, unlock_date, unlock_condition)
select id, now() + interval '30 days', 'graduation'
from trace_insert
on conflict do nothing;
