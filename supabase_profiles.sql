-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  plan_name text default 'Basic' not null,
  storage_limit bigint default 53687091200 not null, -- 50 GB in bytes
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Trigger to create a profile on signup
-- This ensures every new user gets the default 50GB plan
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, plan_name, storage_limit)
  values (new.id, 'Basic', 53687091200);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
