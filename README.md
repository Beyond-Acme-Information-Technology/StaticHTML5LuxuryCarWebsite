# Awesome Luxury Services Group — marketing website

React + Vite site for [awesomeservicesgroups.com](https://awesomeservicesgroups.com). Hosted on Vercel. Leads are emailed through Brevo and listed in the staff inbox.

## Local development

```powershell
npm i
npm run dev:email-proxy
npm run dev
```

The Vite app opens on port 3000. The API proxy listens on port 5001.

## Email (Brevo)

1. In Brevo, revoke any key that appeared in a Word file. Create a new **API key** (preferred) or SMTP key.
2. Verify `FROM_EMAIL` as a sender.
3. Set variables in Vercel and in `.env.local` locally. Never put keys in git or Word files.

Vercel → Project Settings → Environment Variables:

- `BREVO_API_KEY` or `BREVO_SMTP_KEY` + `BREVO_SMTP_USER`
- `FROM_EMAIL`
- `CONTACT_TO_EMAIL`
- `REQUIRE_EMAIL_PROVIDER=true`
- `STAFF_INBOX_TOKEN` (long random string for Login → Staff)

Optional, so the inbox survives Vercel deploys: create a free Supabase project, run `supabase/schema.sql`, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## Staff inbox

Open Login → Staff, enter `STAFF_INBOX_TOKEN`. Requests also still arrive by email.

Check `/api/health` after deploy: `emailConfigured` and `staffInboxConfigured` should be true.

## Production

Push to the GitHub repo connected to Vercel, or use the Vercel CLI from this folder after `vercel login`.

Custom domain: `awesomeservicesgroups.com` (Cloudflare DNS → Vercel).

## Pages

Hash routes: `/`, `/#/services`, `/#/fleet`, `/#/book`, `/#/contact`, `/#/jobs`, `/#/login`, `/#/privacy`, `/#/terms`, `/#/staff`.

Airport landing pages: `/sfo.html`, `/sjc.html`.
