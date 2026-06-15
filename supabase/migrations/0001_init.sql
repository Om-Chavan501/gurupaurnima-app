-- GuruPaurnima 2026 schema
-- Run via: supabase db push  (or paste into Supabase SQL editor)

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles: one row per auth user
-- ============================================================
create type user_role as enum ('guru', 'shishya', 'audience');
create type gender_t as enum ('male', 'female', 'other', 'prefer_not_to_say');
create type event_date as enum ('2026-07-31', '2026-08-01', '2026-08-02');
create type scale_t as enum ('A','A#','B','C','C#','D','D#','E','F','F#','G','G#');
create type instrument_t as enum ('tabla','harmonium','tanpura_digital','tanpura_physical','taal','keyboard');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  dob date,
  gender gender_t,
  role user_role not null default 'shishya',
  is_admin boolean not null default false,
  is_verified boolean not null default false,
  whatsapp_country_code text,
  whatsapp_number text,
  years_with_guru int,
  months_with_guru int,
  profile_pic_url text,
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on profiles (role);
create index on profiles (lower(first_name), lower(last_name));

-- ============================================================
-- attendance_poll: multi-select; absence of rows = none/no attend
-- ============================================================
create table attendance_poll (
  user_id uuid not null references profiles(id) on delete cascade,
  date event_date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, date)
);

create index on attendance_poll (date);

-- ============================================================
-- performances: at most one entry per shishya
-- ============================================================
create table performances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  will_perform boolean not null default false,
  composition_name text,
  composition_notes text,
  scale scale_t,
  instruments instrument_t[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- activity_log: for admin/guru notifications and audit
-- ============================================================
create table activity_log (
  id bigserial primary key,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index on activity_log (created_at desc);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();
create trigger trg_performances_updated before update on performances
  for each row execute function set_updated_at();

-- ============================================================
-- helper: is_admin_or_guru(uid)
-- ============================================================
create or replace function is_admin_or_guru(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'guru' or is_admin from profiles where id = uid),
    false
  );
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table profiles enable row level security;
alter table attendance_poll enable row level security;
alter table performances enable row level security;
alter table activity_log enable row level security;

-- profiles: any authenticated user can read; users can update self; admin/guru can update anyone
create policy profiles_read_authed on profiles
  for select to authenticated using (true);
create policy profiles_insert_self on profiles
  for insert to authenticated with check (id = auth.uid());
create policy profiles_update_self on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on profiles
  for update to authenticated using (is_admin_or_guru(auth.uid())) with check (true);
create policy profiles_delete_admin on profiles
  for delete to authenticated using (is_admin_or_guru(auth.uid()));

-- attendance_poll: read all, write own, admin/guru can write anyone
create policy poll_read on attendance_poll
  for select to authenticated using (true);
create policy poll_write_self on attendance_poll
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy poll_write_admin on attendance_poll
  for all to authenticated using (is_admin_or_guru(auth.uid())) with check (true);

-- performances: read all, write own (any signed-up shishya, no is_verified gate), admin/guru anyone
create policy perf_read on performances
  for select to authenticated using (true);
create policy perf_write_self on performances
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy perf_write_admin on performances
  for all to authenticated using (is_admin_or_guru(auth.uid())) with check (true);

-- activity_log: admin/guru read; anyone writes via server actions
create policy activity_read_admin on activity_log
  for select to authenticated using (is_admin_or_guru(auth.uid()));
create policy activity_insert_self on activity_log
  for insert to authenticated with check (actor_id = auth.uid() or actor_id is null);

-- ============================================================
-- Storage bucket: profile-pics (public)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('profile-pics', 'profile-pics', true)
on conflict (id) do nothing;

create policy "profile-pics read public" on storage.objects
  for select using (bucket_id = 'profile-pics');
create policy "profile-pics write own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'profile-pics'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "profile-pics update own" on storage.objects
  for update to authenticated using (
    bucket_id = 'profile-pics'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "profile-pics delete own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'profile-pics'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
