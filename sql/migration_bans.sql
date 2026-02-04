-- Ban tables migration
create table if not exists banned_hwids (
  id uuid default gen_random_uuid() primary key,
  hwid text unique not null,
  reason text,
  expires_at timestamptz null,
  created_at timestamptz default now()
);

create index if not exists idx_banned_hwids_hwid on banned_hwids(hwid);

create table if not exists banned_ips (
  id uuid default gen_random_uuid() primary key,
  ip text unique not null,
  reason text,
  expires_at timestamptz null,
  created_at timestamptz default now()
);

create index if not exists idx_banned_ips_ip on banned_ips(ip);

create table if not exists ban_audit (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  value text not null,
  reason text,
  admin text,
  created_at timestamptz default now()
);
