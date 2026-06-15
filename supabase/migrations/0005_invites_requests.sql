-- ============================================================
-- Phase 1: code-gated signup, invites, admin requests
-- ============================================================

-- 1. Rename role: itar -> audience  (no-op on fresh installs that already have 'audience')
do $$
begin
  if exists (
    select 1 from pg_enum
    where enumlabel = 'itar'
      and enumtypid = 'user_role'::regtype
  ) then
    execute 'alter type user_role rename value ''itar'' to ''audience''';
  end if;
end $$;

-- 2. Lineage on profiles
alter table profiles
  add column if not exists invited_by uuid references profiles(id) on delete set null,
  add column if not exists invited_as text;  -- 'shishya' | 'audience'

-- 3. Invite codes (audience-only)
create table if not exists invite_codes (
  code           text primary key,                    -- short uppercase like 'A7K9PX'
  creator_id     uuid not null references profiles(id) on delete cascade,
  label          text,                                -- optional note ("for Anita's parents")
  created_at     timestamptz not null default now(),
  expires_at     timestamptz not null,
  redeemed_count int not null default 0,
  revoked_at     timestamptz
);
create index if not exists invite_codes_creator_idx on invite_codes (creator_id);
create index if not exists invite_codes_expires_idx on invite_codes (expires_at);

-- 4. Admin requests (verify | role-change)
create table if not exists admin_requests (
  id           bigserial primary key,
  user_id      uuid not null references profiles(id) on delete cascade,
  request_type text not null check (request_type in ('verify', 'change_to_shishya', 'change_to_audience')),
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'ignored')),
  decided_by   uuid references profiles(id) on delete set null,
  decided_at   timestamptz,
  reason       text,                                  -- admin's note (optional)
  created_at   timestamptz not null default now()
);
create index if not exists admin_requests_status_idx on admin_requests (status, created_at desc);
create index if not exists admin_requests_user_idx on admin_requests (user_id);

-- One pending request per (user, type) at a time
create unique index if not exists admin_requests_one_pending
  on admin_requests (user_id, request_type)
  where status = 'pending';

-- ============================================================
-- RLS
-- ============================================================
alter table invite_codes    enable row level security;
alter table admin_requests  enable row level security;

-- invite_codes: own + admins read; verified users insert; own + admins update (for revoke)
drop policy if exists invite_codes_read_own_or_admin on invite_codes;
create policy invite_codes_read_own_or_admin on invite_codes
  for select to authenticated
  using (creator_id = auth.uid() or is_admin_or_guru(auth.uid()));

drop policy if exists invite_codes_insert_verified on invite_codes;
create policy invite_codes_insert_verified on invite_codes
  for insert to authenticated
  with check (
    creator_id = auth.uid()
    and exists (
      select 1 from profiles
      where id = auth.uid()
        and (is_verified = true or role = 'guru')
    )
  );

drop policy if exists invite_codes_update_own_or_admin on invite_codes;
create policy invite_codes_update_own_or_admin on invite_codes
  for update to authenticated
  using (creator_id = auth.uid() or is_admin_or_guru(auth.uid()))
  with check (creator_id = auth.uid() or is_admin_or_guru(auth.uid()));

-- admin_requests: own + admins read; user inserts own; admins decide (update)
drop policy if exists admin_requests_read on admin_requests;
create policy admin_requests_read on admin_requests
  for select to authenticated
  using (user_id = auth.uid() or is_admin_or_guru(auth.uid()));

drop policy if exists admin_requests_insert_self on admin_requests;
create policy admin_requests_insert_self on admin_requests
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists admin_requests_update_admin on admin_requests;
create policy admin_requests_update_admin on admin_requests
  for update to authenticated
  using (is_admin_or_guru(auth.uid()))
  with check (is_admin_or_guru(auth.uid()));

-- ============================================================
-- Anon-callable resolver: validate an invite code and return creator
-- (used during signup before the user is authenticated)
-- ============================================================
create or replace function resolve_invite_code(p_code text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select creator_id from invite_codes
  where code = upper(p_code)
    and revoked_at is null
    and expires_at > now()
  limit 1;
$$;
grant execute on function resolve_invite_code(text) to anon, authenticated;

create or replace function mark_invite_redeemed(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update invite_codes
  set redeemed_count = redeemed_count + 1
  where code = upper(p_code)
    and revoked_at is null
    and expires_at > now();
$$;
grant execute on function mark_invite_redeemed(text) to authenticated;
