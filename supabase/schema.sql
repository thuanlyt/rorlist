-- Record of Ragnarok Name Registry
-- Run once in Supabase SQL Editor.
-- Replace <ADMIN_PASSWORD> before running.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
set search_path = public, extensions;

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

create table if not exists public.ror_name_styles (
  name_id text primary key,
  display_name text not null,
  group_title text not null,
  custom_element text not null,
  custom_color text not null check (custom_color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ror_free_names (
  id text primary key,
  display_name text not null,
  group_title text not null default 'Tên tự do',
  owner_name text not null,
  identity_text text not null default '',
  note text not null default '',
  custom_element text,
  custom_color text check (custom_color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.ror_free_names
  alter column custom_element drop not null,
  alter column custom_color drop not null;

insert into public.ror_ui_settings (id, effect_type, effect_duration, effect_intensity, updated_at)
values ('global', 'sweep', 1.7, 0.78, now())
on conflict (id) do nothing;

alter table public.ror_admin_settings enable row level security;
alter table public.ror_name_claims enable row level security;
alter table public.ror_ui_settings enable row level security;
alter table public.ror_name_styles enable row level security;
alter table public.ror_free_names enable row level security;

alter table public.ror_name_claims replica identity full;
alter table public.ror_ui_settings replica identity full;
alter table public.ror_name_styles replica identity full;
alter table public.ror_free_names replica identity full;

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

drop policy if exists "Public read name styles" on public.ror_name_styles;
create policy "Public read name styles"
on public.ror_name_styles
for select
to anon, authenticated
using (true);

drop policy if exists "Public read free names" on public.ror_free_names;
create policy "Public read free names"
on public.ror_free_names
for select
to anon, authenticated
using (true);

create or replace function public.ror_admin_check(p_admin_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
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
set search_path = public, extensions
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
    name_id, display_name, group_title, owner_name, identity_text, note, updated_at
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
set search_path = public, extensions
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
set search_path = public, extensions
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

create or replace function public.ror_upsert_name_style(
  p_admin_password text,
  p_name_id text,
  p_display_name text,
  p_group_title text,
  p_custom_element text,
  p_custom_color text
)
returns public.ror_name_styles
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  result public.ror_name_styles;
begin
  if not public.ror_admin_check(p_admin_password) then
    raise exception 'Invalid admin password' using errcode = '28000';
  end if;

  if nullif(trim(p_name_id), '') is null
     or nullif(trim(p_custom_element), '') is null
     or p_custom_color !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'Invalid style payload' using errcode = '22023';
  end if;

  insert into public.ror_name_styles (
    name_id, display_name, group_title, custom_element, custom_color, updated_at
  ) values (
    p_name_id,
    coalesce(nullif(trim(p_display_name), ''), p_name_id),
    coalesce(nullif(trim(p_group_title), ''), 'Unknown'),
    trim(p_custom_element),
    lower(p_custom_color),
    now()
  )
  on conflict (name_id) do update
  set display_name = excluded.display_name,
      group_title = excluded.group_title,
      custom_element = excluded.custom_element,
      custom_color = excluded.custom_color,
      updated_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function public.ror_delete_name_style(
  p_admin_password text,
  p_name_id text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.ror_admin_check(p_admin_password) then
    raise exception 'Invalid admin password' using errcode = '28000';
  end if;

  delete from public.ror_name_styles
  where name_id = p_name_id;
end;
$$;


create or replace function public.ror_upsert_free_name(
  p_admin_password text,
  p_id text,
  p_display_name text,
  p_owner_name text,
  p_identity_text text default '',
  p_note text default '',
  p_custom_element text default '',
  p_custom_color text default ''
)
returns public.ror_free_names
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  result public.ror_free_names;
  final_id text;
  final_element text;
  final_color text;
begin
  if not public.ror_admin_check(p_admin_password) then
    raise exception 'Invalid admin password' using errcode = '28000';
  end if;

  final_element := nullif(trim(coalesce(p_custom_element, '')), '');
  final_color := nullif(lower(trim(coalesce(p_custom_color, ''))), '');

  if nullif(trim(p_display_name), '') is null
     or nullif(trim(p_owner_name), '') is null
     or ((final_element is null) <> (final_color is null))
     or (final_color is not null and final_color !~ '^#[0-9A-Fa-f]{6}$') then
    raise exception 'Invalid free name payload' using errcode = '22023';
  end if;

  final_id := nullif(trim(coalesce(p_id, '')), '');
  if final_id is null then
    final_id := 'free-' || substr(md5(lower(trim(p_display_name)) || '-' || lower(trim(p_owner_name)) || '-' || extract(epoch from clock_timestamp())::text), 1, 20);
  end if;

  insert into public.ror_free_names (
    id, display_name, group_title, owner_name, identity_text, note, custom_element, custom_color, updated_at
  ) values (
    final_id,
    trim(p_display_name),
    'Tên tự do',
    trim(p_owner_name),
    coalesce(p_identity_text, ''),
    coalesce(p_note, ''),
    final_element,
    final_color,
    now()
  )
  on conflict (id) do update
  set display_name = excluded.display_name,
      group_title = 'Tên tự do',
      owner_name = excluded.owner_name,
      identity_text = excluded.identity_text,
      note = excluded.note,
      custom_element = excluded.custom_element,
      custom_color = excluded.custom_color,
      updated_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function public.ror_delete_free_name(
  p_admin_password text,
  p_id text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.ror_admin_check(p_admin_password) then
    raise exception 'Invalid admin password' using errcode = '28000';
  end if;

  delete from public.ror_free_names
  where id = p_id;
end;
$$;

revoke all on function public.ror_admin_check(text) from public;
revoke all on function public.ror_upsert_name_claim(text, text, text, text, text, text, text) from public;
revoke all on function public.ror_delete_name_claim(text, text) from public;
revoke all on function public.ror_update_ui_settings(text, text, numeric, numeric) from public;
revoke all on function public.ror_upsert_name_style(text, text, text, text, text, text) from public;
revoke all on function public.ror_delete_name_style(text, text) from public;
revoke all on function public.ror_upsert_free_name(text, text, text, text, text, text, text, text) from public;
revoke all on function public.ror_delete_free_name(text, text) from public;

grant execute on function public.ror_admin_check(text) to anon, authenticated;
grant execute on function public.ror_upsert_name_claim(text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.ror_delete_name_claim(text, text) to anon, authenticated;
grant execute on function public.ror_update_ui_settings(text, text, numeric, numeric) to anon, authenticated;
grant execute on function public.ror_upsert_name_style(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.ror_delete_name_style(text, text) to anon, authenticated;
grant execute on function public.ror_upsert_free_name(text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.ror_delete_free_name(text, text) to anon, authenticated;

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

do $$
begin
  alter publication supabase_realtime add table public.ror_name_styles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.ror_free_names;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- Merge legacy duplicate IDs into the kept canonical IDs.
do $$
declare
  old_id text;
  new_id text;
  new_display text;
  new_group text;
begin
  old_id := 'olympus-zeus'; new_id := 'ror-gods-fighters-zeus'; new_display := 'RoR · Zeus'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'olympus-poseidon'; new_id := 'ror-gods-fighters-poseidon'; new_display := 'RoR · Poseidon'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'olympus-apollo'; new_id := 'ror-gods-fighters-apollo'; new_display := 'RoR · Apollo'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'underworld-hades'; new_id := 'ror-gods-fighters-hades'; new_display := 'RoR · Hades'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'heroes-heracles'; new_id := 'ror-gods-fighters-heracles'; new_display := 'RoR · Heracles'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'heroes-leonidas'; new_id := 'ror-einherjar-leonidas'; new_display := 'RoR · Leonidas'; new_group := 'Record of Ragnarok · Einherjar';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'norse-gods-odin'; new_id := 'ror-gods-fighters-odin'; new_display := 'RoR · Odin'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'norse-gods-thor'; new_id := 'ror-gods-fighters-thor'; new_display := 'RoR · Thor'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'norse-gods-loki'; new_id := 'ror-gods-fighters-loki'; new_display := 'RoR · Loki'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'norse-creatures-sleipnir'; new_id := 'divine-beasts-sleipnir'; new_display := 'RoR · Sleipnir'; new_group := 'Thú Thiêng, Linh Vật và Chiến Mã';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'norse-creatures-huginn'; new_id := 'divine-beasts-huginn'; new_display := 'RoR · Huginn'; new_group := 'Thú Thiêng, Linh Vật và Chiến Mã';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'norse-creatures-muninn'; new_id := 'divine-beasts-muninn'; new_display := 'RoR · Muninn'; new_group := 'Thú Thiêng, Linh Vật và Chiến Mã';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'valkyries-brunhilde'; new_id := 'ror-valkyries-brunhilde'; new_display := 'RoR · Brunhilde'; new_group := 'Record of Ragnarok · 13 Valkyrie';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'valkyries-goll'; new_id := 'ror-valkyries-goll'; new_display := 'RoR · Goll'; new_group := 'Record of Ragnarok · 13 Valkyrie';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'valkyries-randgriz'; new_id := 'ror-valkyries-randgriz'; new_display := 'RoR · Randgriz'; new_group := 'Record of Ragnarok · 13 Valkyrie';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'valkyries-reginleif'; new_id := 'ror-valkyries-reginleif'; new_display := 'RoR · Reginleif'; new_group := 'Record of Ragnarok · 13 Valkyrie';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'valkyries-hrist'; new_id := 'ror-valkyries-hrist'; new_display := 'RoR · Hrist'; new_group := 'Record of Ragnarok · 13 Valkyrie';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'valkyries-gondul'; new_id := 'ror-valkyries-gondul'; new_display := 'RoR · Gondul'; new_group := 'Record of Ragnarok · 13 Valkyrie';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'outside-beelzebub'; new_id := 'ror-gods-fighters-beelzebub'; new_display := 'RoR · Beelzebub'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'buddhist-buddha'; new_id := 'ror-einherjar-buddha'; new_display := 'RoR · Buddha'; new_group := 'Record of Ragnarok · Einherjar';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'hindu-shiva'; new_id := 'ror-gods-fighters-shiva'; new_display := 'RoR · Shiva'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'buddhist-zerofuku'; new_id := 'ror-gods-fighters-zerofuku'; new_display := 'RoR · Zerofuku'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'buddhist-hajun'; new_id := 'ror-gods-fighters-hajun'; new_display := 'RoR · Hajun'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'japanese-susano-o-no-mikoto'; new_id := 'ror-gods-fighters-susano-o-no-mikoto'; new_display := 'RoR · Susano''o no Mikoto'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
  old_id := 'egyptian-anubis'; new_id := 'ror-gods-fighters-anubis'; new_display := 'RoR · Anubis'; new_group := 'Record of Ragnarok · Đấu Sĩ Thần';
  if exists (select 1 from public.ror_name_claims where name_id = old_id) and not exists (select 1 from public.ror_name_claims where name_id = new_id) then
    update public.ror_name_claims set name_id = new_id, display_name = new_display, group_title = new_group, updated_at = now() where name_id = old_id;
  elsif exists (select 1 from public.ror_name_claims where name_id = old_id) then
    delete from public.ror_name_claims where name_id = old_id;
  end if;
end $$;

