-- Quick snippets for manual admin management.
-- Run whichever you need in the SQL editor.

-- Make someone an admin (replace email):
update profiles set is_admin = true  where email = 'someone@example.com';

-- Remove admin:
update profiles set is_admin = false where email = 'someone@example.com';

-- See all current admins:
select id, first_name, last_name, email, role, is_admin, is_verified
from profiles
where is_admin = true or role = 'guru'
order by role, first_name;
