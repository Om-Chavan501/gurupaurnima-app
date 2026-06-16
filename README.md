# Saurabh Dada's Gurupaurnima 2026

A coordination app for Saurabh Dada's Gurupaurnima program. Bilingual (Marathi default, English toggle), raag-themed, with code-gated signup for shishyas and invite-gated audience access.

## Stack
- **Next.js 15** (App Router) + TypeScript + Tailwind v4
- **Framer Motion** for transitions
- **Supabase** — Postgres, Auth (magic link + password), Storage (profile pics), Row-Level Security
- **Vercel** (free Hobby) for hosting
- **Type pairing:** Cormorant Garamond + Inter (English); Tiro Devanagari Marathi + Hind (Marathi)

---

## 1. Supabase setup

You'll need a Supabase project on the free plan.

1. Go to https://supabase.com → New project. Pick a region near you (e.g. ap-south-1 / Mumbai).
2. Wait for it to provision (~2 min).
3. From **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **`anon` public key** (legacy `eyJ…` or new `sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Open the **SQL Editor** → New query → paste and **Run**, in this order:
   - `supabase/migrations/0001_init.sql` — base schema
   - `supabase/migrations/0003_activity_read.sql` — unread-tracker column
   - `supabase/migrations/0005_invites_requests.sql` — invite codes, admin requests, SECURITY DEFINER helpers
5. *(After Saurabh-ji signs up)* run `supabase/migrations/0002_seed_guru.sql` to promote his account to `role = 'guru'`. Edit the email in that file if needed.
6. *(Anytime you need a clean slate)* `supabase/migrations/0000_reset.sql` drops the schema and wipes the `profile-pics` bucket. Then re-run 0001/0003/0005 (and 0002 again post-signup).

### Auth settings (Supabase Dashboard → Authentication → URL Configuration)
- **Site URL:** `http://localhost:3000` for dev, `https://gurupaurnima-2026.vercel.app` for prod
- **Redirect URLs (Additional):** both of the above, plus `/auth/callback`

### Email templates
Branded HTML for the three templates lives in `supabase/email-templates/`. In Supabase → **Authentication → Email Templates**, paste:
- `confirm-signup.html` into "Confirm signup"
- `magic-link.html` into "Magic Link"
- `reset-password.html` into "Reset Password"

### Storage
The migration creates a public `profile-pics` bucket and writes RLS so each user can upload only into their own `userId/` folder. If the auto-create silently fails in your region, create it manually: **Storage → New bucket** → `profile-pics` → **Public** ON.

---

## 2. Local development

```bash
cp .env.example .env.local
# fill in every value (see §4)

npm install
npm run dev
```

Visit http://localhost:3000.

---

## 3. Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Go to https://vercel.com → Import the repo.
3. Add every env var from `.env.example` under **Project Settings → Environment Variables**.
4. Deploy. Rename the deployment to `gurupaurnima-2026` in Vercel project settings if desired.
5. Add the Vercel URL to Supabase → Auth → URL Configuration (Site URL + redirect list) so magic-link emails point at production.

No Dockerfile, no separate backend.

---

## 4. Env variables

| Key | Public? | What it's for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon / publishable key |
| `NEXT_PUBLIC_GURU_WHATSAPP` | yes | Saurabh Dada's WhatsApp (`+91…`) |
| `NEXT_PUBLIC_GURU_PHONE` | yes | Saurabh Dada's phone (`+91…`) |
| `NEXT_PUBLIC_WHATSAPP_GROUP_URL` | yes | WhatsApp group invite link (verified shishyas only) |
| `NEXT_PUBLIC_ADMIN_NAME` | yes | Admin contact name (shown on signup-help & profile escape hatch) |
| `NEXT_PUBLIC_ADMIN_WHATSAPP` | yes | Signup-help admin WhatsApp (separate from the guru) |
| `NEXT_PUBLIC_ADMIN_PHONE` | yes | Signup-help admin phone |
| `NEXT_PUBLIC_SITE_URL` | yes | Used in some places; Vercel sets it automatically |
| `SHISHYA_CODE_SECRET` | **no — server-only** | Any long random string. The daily shishya code is `HMAC-SHA256(secret, "YYYY-MM-DD" IST) → 6 digits`. Rotate to invalidate every previously-shared code. |

---

## 5. Roles & access

- **guru** — Saurabh Dada. Seeded by `0002_seed_guru.sql`. Can do everything.
- **shishya** — student. Joins with the daily shishya code. Edits own poll + performance entries.
- **audience (श्रोता)** — non-student attendee. Joins via 24h invite code. Fills the poll but doesn't perform.
- **admin** — toggle in DB (`profiles.is_admin = true`) or via the "Make admin" button (only the guru sees it). **A user must be verified before being made admin.** Both shishyas and audience can be admins.
- **is_verified** — shows the WhatsApp group link; required to generate invite codes; required for admin promotion. Guru or any admin toggles it.

### Access codes
- **Daily shishya code** — 6 digits derived from `SHISHYA_CODE_SECRET + today's IST date` (HMAC-SHA256). All admins see today's code on `/app/admin`. Rotates daily at midnight IST. Yesterday's code is accepted as a grace window.
- **Invite codes** — 6 chars generated by verified users from `/app/invite`. 24h expiry, multi-use, revocable. Used by audience signups.

### Admin requests
On `/app/profile` an unverified user can request verification, and any user can request a role change (shishya ↔ audience). Admins decide on `/app/admin` (Accept / Reject / Ignore). All actions write to the activity log and surface in the bell feed.

---

## 6. Raag themes
Six themes live in `src/app/globals.css` under `[data-raag="..."]`. Switcher in the top nav. Adding a new raag = adding one CSS block + one entry in `src/lib/raag.ts`.

---

## 7. Language
- Marathi (मराठी) is the default. English available via the toggle next to Raag in the nav.
- Locale persists in a `gp.locale` cookie for 5 years.
- Display Marathi: **Tiro Devanagari Marathi** (calligraphic serif). Body Marathi: **Hind** (humanist Devanagari sans). English: Cormorant Garamond + Inter.
- Translations live in `src/i18n/{en,mr}.json`. Add new keys as you add UI — `t("missing.key")` falls back to English, then to the literal key.

---

## 8. Architecture in 60 seconds
- `src/app/page.tsx` — public landing
- `src/app/signup/*` — code-gated 4-step signup (role → code → details → magic-link sent → profile)
- `src/app/login`, `/forgot`, `/reset`, `/logout`, `/auth/callback`, `/auth/error` — auth surface
- `src/app/app/*` — authed area (layout guards redirect to `/login` or `/signup/profile`)
- `src/app/app/admin` — today's shishya code, pending admin requests, recent invites
- `src/app/app/invite` — verified users generate audience invite codes
- `src/app/app/event` — concert details (TBD placeholders)
- `src/app/app/activity` — admin-only activity feed
- `src/lib/actions.ts` — server actions (poll, perf, admin toggles, requests, role flips, invite create/revoke)
- `src/lib/shishyaCode.ts` — HOTP-style daily code + invite token generator (server only)
- `src/lib/i18n.ts` + `i18n-server.ts` — locale machinery
- `src/lib/supabase/{client,server,middleware}.ts` — Supabase SSR helpers
- `src/middleware.ts` — refreshes auth cookies on every request
- `supabase/migrations/` — schema + RLS, run in order 0001 → 0003 → 0005; 0002 after first guru signup; 0000 to reset

---

## 9. Open follow-ups (parked for v1.1)
- **+N companions** — each shishya declares family/guests they're bringing, editable closer to the date.
- **Concert details (`/app/event`)** — currently "to be finalised" placeholders for venue/time/format/dress. Wire to an `event_meta` table or env when finalised.
- **Custom SMTP** — swap from Supabase default mailer to Resend/Postmark once volume justifies it.
