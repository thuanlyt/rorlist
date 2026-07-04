# Record of Ragnarok Name Archive

Production React/Vite source for a Record of Ragnarok name registry.

## Main features

- Full name archive grouped by mythology / RoR category.
- Search, group filter, used/free filter, copy available names.
- Admin mode for assigning a name to a real user/player.
- Owner name is shown beside the main name in neutral text.
- Full owner details open in a modal.
- Modal open/close animation is implemented in React + CSS.
- Highlight effects are applied to famous names only.
- Admin can sync the global highlight effect across all devices through Supabase.
- Supabase Realtime subscription updates name claims and UI effect settings across devices.

## Netlify / Vercel environment variables

Create these variables in your hosting dashboard:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`VITE_IMGBB_API_KEY` is not required for this version because image upload is not used yet.

## Supabase setup

1. Open Supabase Dashboard.
2. Go to SQL Editor.
3. Open `supabase/schema.sql` from this source.
4. Replace `<ADMIN_PASSWORD>` with your private admin password.
5. Run the SQL once.
6. Do not commit a SQL file containing the real password to GitHub.

The SQL creates:

- `ror_name_claims`
- `ror_ui_settings`
- `ror_admin_settings`
- Admin RPC functions for password check, name assignment, name release, and effect settings.

The frontend uses the anon key only. Writes go through SECURITY DEFINER RPC functions and require the admin password.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Production build

```bash
npm run build
```

Publish directory:

```text
dist
```

Build command:

```text
npm run build
```
