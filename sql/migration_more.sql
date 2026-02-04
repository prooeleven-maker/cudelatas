-- Additional migrations: releases and admin_sessions, ensure last_ip
create table if not exists releases (
  id uuid default gen_random_uuid() primary key,
  channel text not null, -- e.g. stable, beta
  version text not null,
  notes text,
  file_url text, -- storage URL to the release artifact
  created_at timestamptz default now()
);

create index if not exists idx_releases_channel_version on releases(channel, version);

create table if not exists admin_sessions (
  id uuid default gen_random_uuid() primary key,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- ensure last_ip exists
alter table license_keys add column if not exists last_ip text;
