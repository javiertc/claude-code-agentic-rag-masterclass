-- messages table: stores chat messages per thread
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_messages_thread_id on public.messages(thread_id);
create index idx_messages_created_at on public.messages(thread_id, created_at asc);

alter table public.messages enable row level security;

-- RLS policies: users can only access their own messages
create policy "Users can select own messages"
  on public.messages for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own messages"
  on public.messages for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own messages"
  on public.messages for delete
  using ((select auth.uid()) = user_id);
