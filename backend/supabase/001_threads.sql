-- threads table: conversation metadata per user
create table public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Chat',
  last_response_id text,
  vector_store_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_threads_user_id on public.threads(user_id);
create index idx_threads_updated_at on public.threads(updated_at desc);

alter table public.threads enable row level security;

-- RLS policies: users can only access their own threads
create policy "Users can select own threads"
  on public.threads for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own threads"
  on public.threads for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own threads"
  on public.threads for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete own threads"
  on public.threads for delete
  using ((select auth.uid()) = user_id);

-- Auto-update updated_at on row modification
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.threads
  for each row
  execute function public.handle_updated_at();
