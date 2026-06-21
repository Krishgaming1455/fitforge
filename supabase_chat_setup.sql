-- ============================================================
-- FitForge Community Chat — Database Setup
-- Run this entire block in Supabase SQL Editor, then click "Run"
-- ============================================================

-- 1. Public community board messages
create table community_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  display_name text,
  message text,
  created_at timestamp default now()
);
alter table community_messages enable row level security;
create policy "Anyone can read community messages" on community_messages for select using (true);
create policy "Users can insert own messages" on community_messages for insert with check (auth.uid() = user_id);
create policy "Users can delete own messages" on community_messages for delete using (auth.uid() = user_id);

-- 2. Private direct messages
create table direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users on delete cascade,
  recipient_id uuid references auth.users on delete cascade,
  display_name text,
  message text,
  read boolean default false,
  created_at timestamp default now()
);
alter table direct_messages enable row level security;
create policy "Users see own sent/received DMs" on direct_messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Users can send DMs" on direct_messages for insert with check (auth.uid() = sender_id);

-- 3. Message reports
create table message_reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references auth.users on delete cascade,
  reported_message_id uuid,
  reported_message_text text,
  reason text,
  created_at timestamp default now()
);
alter table message_reports enable row level security;
create policy "Users can insert reports" on message_reports for insert with check (auth.uid() = reporter_id);

-- 4. User blocks
create table user_blocks (
  blocker_id uuid references auth.users on delete cascade,
  blocked_id uuid references auth.users on delete cascade,
  created_at timestamp default now(),
  primary key (blocker_id, blocked_id)
);
alter table user_blocks enable row level security;
create policy "Users manage own blocks" on user_blocks for all using (auth.uid() = blocker_id);

-- ============================================================
-- After running this, also do this manually in the dashboard:
-- Go to Database → Replication → toggle ON for:
--   - community_messages
--   - direct_messages
-- This enables real-time updates so messages appear instantly
-- without needing to refresh the page.
-- ============================================================

-- ============================================================
-- Public Routines table (Session 17 — view partner's workout routine)
-- ============================================================
create table public_routines (
  user_id uuid references auth.users on delete cascade primary key,
  display_name text,
  experience_level text,
  custom_exercises jsonb default '{}'::jsonb,
  updated_at timestamp default now()
);
alter table public_routines enable row level security;
create policy "Anyone can view public routines" on public_routines for select using (true);
create policy "Users can update own routine" on public_routines for all using (auth.uid() = user_id);

-- ============================================================
-- Privacy columns for public_routines (Session 18)
-- ============================================================
alter table public_routines add column if not exists hide_routine boolean default false;
alter table public_routines add column if not exists hide_stats boolean default false;
