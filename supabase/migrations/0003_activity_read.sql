-- Per-user "last viewed activity feed" timestamp.
-- Used to compute unread count for admins / guru.
alter table profiles
  add column if not exists notifications_read_at timestamptz;

-- Let any authed user read activity_log (we'll only surface it in /app/activity for admins/guru).
drop policy if exists activity_read_admin on activity_log;
create policy activity_read_authed on activity_log
  for select to authenticated using (true);
