-- ============================================================
-- FULL RESET — wipes all app data and schema, then re-runs
-- from scratch. Safe to run multiple times (idempotent).
--
-- Usage (Supabase SQL editor): paste and Run.
-- This does NOT touch auth.users — delete those manually in
-- Authentication → Users if you want a truly clean slate.
-- ============================================================

-- 1. Drop tables (cascade handles FK order)
drop table if exists admin_requests    cascade;
drop table if exists invite_codes      cascade;
drop table if exists activity_log      cascade;
drop table if exists digest_state      cascade;
drop table if exists performances      cascade;
drop table if exists attendance_poll   cascade;
drop table if exists profiles          cascade;

-- 2. Drop custom types
drop type if exists instrument_t cascade;
drop type if exists scale_t      cascade;
drop type if exists event_date   cascade;
drop type if exists gender_t     cascade;
drop type if exists user_role    cascade;

-- 3. Drop helper functions / triggers (already cascade-dropped with tables,
--    but be explicit so re-runs are clean)
drop function if exists set_updated_at()         cascade;
drop function if exists is_admin_or_guru(uuid)   cascade;
drop function if exists resolve_invite_code(text) cascade;
drop function if exists mark_invite_redeemed(text) cascade;

-- 4. Storage: remove all objects in the profile-pics bucket
--    (the bucket itself stays; objects are wiped)
delete from storage.objects where bucket_id = 'profile-pics';

-- ============================================================
-- Done. Now run 0001_init.sql to rebuild the schema,
-- then 0002_seed_guru.sql to promote Saurabh Dada's account
-- (only after he has signed up again).
-- ============================================================
