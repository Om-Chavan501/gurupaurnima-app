-- Seed: ensure the guru profile exists once auth user has signed up.
-- Run this AFTER Saurabh-ji signs up via magic link with saurabhkadgaonkar@gmail.com
-- This idempotently promotes that account to role=guru.

update profiles
set role = 'guru',
    is_verified = true,
    profile_completed = true
where email = 'omchavan.dev@gmail.com';
-- where email = 'saurabhkadgaonkar@gmail.com';
