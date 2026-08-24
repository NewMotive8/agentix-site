-- Table backing POST /api/public/verita-subscribe
-- RLS is enabled with NO policies: the table is unreachable from the browser.
-- Only the server-side service role (which bypasses RLS) can read/write it.

create table if not exists public.verita_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

grant all on public.verita_subscribers to service_role;
-- deliberately NO grants for anon / authenticated

alter table public.verita_subscribers enable row level security;
