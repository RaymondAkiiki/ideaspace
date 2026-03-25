-- ============================================================
-- Ideaspace — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- IDEAS TABLE
-- ============================================================
create table if not exists public.ideas (
  id                uuid primary key default gen_random_uuid(),
  title             text,
  draft_content     text not null,
  body_explanation  text,
  body_solution     text,
  body_conclusion   text,
  cover_image_url   text,
  status            text not null default 'draft'
                    check (status in ('draft', 'processed', 'published')),
  slug              text unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- AUTO-UPDATE updated_at ON EVERY ROW CHANGE
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.ideas;
create trigger set_updated_at
  before update on public.ideas
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- The app uses the service role key for all writes (server-only)
-- and the anon key only for reading published ideas publicly.
-- ============================================================
alter table public.ideas enable row level security;

-- Allow anyone to read published ideas (public site)
create policy "Public can read published ideas"
  on public.ideas for select
  using (status = 'published');

-- Service role bypasses RLS automatically — no extra policy needed.
-- All portal writes go through the admin client which uses service role.

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists ideas_status_idx on public.ideas (status);
create index if not exists ideas_slug_idx on public.ideas (slug);
create index if not exists ideas_created_at_idx on public.ideas (created_at desc);
