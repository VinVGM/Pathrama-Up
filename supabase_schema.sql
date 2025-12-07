-- Create the table for storing file metadata
create table public.files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  key text not null,
  name text not null,
  size bigint not null,
  type text not null,
  storage_class text default 'STANDARD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_accessed timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.files enable row level security;

-- Create policies
create policy "Users can view their own files" on public.files
  for select using (auth.uid() = user_id);

create policy "Users can upload their own files" on public.files
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own files" on public.files
  for update using (auth.uid() = user_id);
