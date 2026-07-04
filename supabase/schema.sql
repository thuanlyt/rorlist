-- Record of Ragnarok Name Registry
-- Run this once in Supabase SQL Editor.
-- Replace <ADMIN_PASSWORD> with your private admin password before running.
-- Do not commit a SQL file containing your real password to GitHub.

create extension if not exists pgcrypto;

create table if not exists public.ror_admin_settings (
  id text primary key default 'main',
  password_hash text not null,
  updated_at timestamptz not null default now()
);

insert into public.ror_admin_settings (id, password_hash, updated_at)
values ('main', crypt('<ADMIN_PASSWORD>', gen_salt('bf')), now())
on conflict (id) do update
set password_hash = excluded.password_hash,
    updated_at = now();

create table if not exists public.ror_name_claims (
  name_id text primary key,
  display_name text not null,
  group_title text not null,
  owner_name text not null,
  identity_text text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ror_ui_settings (
  id text primary key default 'global',
  effect_type text not null default 'sweep' check (effect_type in ('sweep', 'pulse', 'breathe', 'static')),
  effect_duration numeric not null default 1.7 check (effect_duration >= 0.4 and effect_duration <= 8),
  effect_intensity numeric not null default 0.78 check (effect_intensity >= 0.2 and effect_intensity <= 1),
  updated_at timestamptz not null default now()
);

insert into public.ror_ui_settings (id, effect_type, effect_duration, effect_intensity, updated_at)
values ('global', 'sweep', 1.7, 0.78, now())
on conflict (id) do nothing;

alter table public.ror_admin_settings enable row level security;
alter table public.ror_name_claims enable row level security;
alter table public.ror_ui_settings enable row level security;

alter table public.ror_name_claims replica identity full;
alter table public.ror_ui_settings replica identity full;

drop policy if exists "Public read name claims" on public.ror_name_claims;
create policy "Public read name claims"
on public.ror_name_claims
for select
to anon, authenticated
using (true);

drop policy if exists "Public read ui settings" on public.ror_ui_settings;
create policy "Public read ui settings"
on public.ror_ui_settings
for select
to anon, authenticated
using (true);

-- No public policy is created for ror_admin_settings.
-- Writes are only done through SECURITY DEFINER RPC functions below.

create or replace function public.ror_admin_check(p_admin_password text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_hash text;
begin
  select password_hash into stored_hash
  from public.ror_admin_settings
  where id = 'main';

  if stored_hash is null or p_admin_password is null then
    return false;
  end if;

  return crypt(p_admin_password, stored_hash) = stored_hash;
end;
$$;

create or replace function public.ror_upsert_name_claim(
  p_admin_password text,
  p_name_id text,
  p_display_name text,
  p_group_title text,
  p_owner_name text,
  p_identity_text text default '',
  p_note text default ''
)
returns public.ror_name_claims
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.ror_name_claims;
begin
  if not public.ror_admin_check(p_admin_password) then
    raise exception 'Invalid admin password' using errcode = '28000';
  end if;

  if nullif(trim(p_name_id), '') is null or nullif(trim(p_owner_name), '') is null then
    raise exception 'name_id and owner_name are required' using errcode = '22023';
  end if;

  insert into public.ror_name_claims (
    name_id,
    display_name,
    group_title,
    owner_name,
    identity_text,
    note,
    updated_at
  ) values (
    p_name_id,
    coalesce(nullif(trim(p_display_name), ''), p_name_id),
    coalesce(nullif(trim(p_group_title), ''), 'Unknown'),
    trim(p_owner_name),
    coalesce(p_identity_text, ''),
    coalesce(p_note, ''),
    now()
  )
  on conflict (name_id) do update
  set display_name = excluded.display_name,
      group_title = excluded.group_title,
      owner_name = excluded.owner_name,
      identity_text = excluded.identity_text,
      note = excluded.note,
      updated_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function public.ror_delete_name_claim(
  p_admin_password text,
  p_name_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.ror_admin_check(p_admin_password) then
    raise exception 'Invalid admin password' using errcode = '28000';
  end if;

  delete from public.ror_name_claims
  where name_id = p_name_id;
end;
$$;

create or replace function public.ror_update_ui_settings(
  p_admin_password text,
  p_effect_type text,
  p_effect_duration numeric,
  p_effect_intensity numeric
)
returns public.ror_ui_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.ror_ui_settings;
begin
  if not public.ror_admin_check(p_admin_password) then
    raise exception 'Invalid admin password' using errcode = '28000';
  end if;

  if p_effect_type not in ('sweep', 'pulse', 'breathe', 'static') then
    raise exception 'Invalid effect type' using errcode = '22023';
  end if;

  insert into public.ror_ui_settings (id, effect_type, effect_duration, effect_intensity, updated_at)
  values (
    'global',
    p_effect_type,
    least(greatest(coalesce(p_effect_duration, 1.7), 0.4), 8),
    least(greatest(coalesce(p_effect_intensity, 0.78), 0.2), 1),
    now()
  )
  on conflict (id) do update
  set effect_type = excluded.effect_type,
      effect_duration = excluded.effect_duration,
      effect_intensity = excluded.effect_intensity,
      updated_at = now()
  returning * into result;

  return result;
end;
$$;

revoke all on function public.ror_admin_check(text) from public;
revoke all on function public.ror_upsert_name_claim(text, text, text, text, text, text, text) from public;
revoke all on function public.ror_delete_name_claim(text, text) from public;
revoke all on function public.ror_update_ui_settings(text, text, numeric, numeric) from public;

grant execute on function public.ror_admin_check(text) to anon, authenticated;
grant execute on function public.ror_upsert_name_claim(text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.ror_delete_name_claim(text, text) to anon, authenticated;
grant execute on function public.ror_update_ui_settings(text, text, numeric, numeric) to anon, authenticated;

-- Realtime sync. If Supabase says a table already exists in the publication, the exception is ignored.
do $$
begin
  alter publication supabase_realtime add table public.ror_name_claims;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.ror_ui_settings;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
