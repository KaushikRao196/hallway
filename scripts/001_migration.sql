-- =====================================================
-- Hallway: Full Supabase Migration
-- =====================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  anon_handle text not null,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- 2. CLASSES
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
alter table public.classes enable row level security;
create policy "classes_select_all" on public.classes for select using (true);
create policy "classes_insert_auth" on public.classes for insert with check (auth.uid() is not null);
create policy "classes_update_auth" on public.classes for update using (auth.uid() is not null);
create policy "classes_delete_auth" on public.classes for delete using (auth.uid() is not null);

-- 3. TEACHERS
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
alter table public.teachers enable row level security;
create policy "teachers_select_all" on public.teachers for select using (true);
create policy "teachers_insert_auth" on public.teachers for insert with check (auth.uid() is not null);
create policy "teachers_update_auth" on public.teachers for update using (auth.uid() is not null);
create policy "teachers_delete_auth" on public.teachers for delete using (auth.uid() is not null);

-- 4. QUESTIONS
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  class_id uuid references public.classes(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  title text not null,
  body text default '',
  created_at timestamptz default now()
);
alter table public.questions enable row level security;
create policy "questions_select_all" on public.questions for select using (true);
create policy "questions_insert_auth" on public.questions for insert with check (auth.uid() is not null);
create policy "questions_update_owner" on public.questions for update using (auth.uid() = user_id);
create policy "questions_delete_owner" on public.questions for delete using (auth.uid() = user_id);

-- 5. ANSWERS
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade,
  user_id uuid references auth.users(id),
  body text not null,
  score int default 0,
  created_at timestamptz default now()
);
alter table public.answers enable row level security;
create policy "answers_select_all" on public.answers for select using (true);
create policy "answers_insert_auth" on public.answers for insert with check (auth.uid() is not null);
create policy "answers_update_owner" on public.answers for update using (auth.uid() = user_id);
create policy "answers_delete_owner" on public.answers for delete using (auth.uid() = user_id);

-- 6. VOTES
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  answer_id uuid references public.answers(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  unique(user_id, answer_id)
);
alter table public.votes enable row level security;
create policy "votes_select_all" on public.votes for select using (true);
create policy "votes_insert_own" on public.votes for insert with check (auth.uid() = user_id);
create policy "votes_update_own" on public.votes for update using (auth.uid() = user_id);
create policy "votes_delete_own" on public.votes for delete using (auth.uid() = user_id);

-- 7. TEACHER_RATINGS
create table if not exists public.teacher_ratings (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teachers(id) on delete cascade,
  user_id uuid references auth.users(id),
  difficulty int not null check (difficulty between 1 and 5),
  fairness int not null check (fairness between 1 and 5),
  workload int not null check (workload between 1 and 5),
  created_at timestamptz default now(),
  unique(teacher_id, user_id)
);
alter table public.teacher_ratings enable row level security;
create policy "teacher_ratings_select_all" on public.teacher_ratings for select using (true);
create policy "teacher_ratings_insert_auth" on public.teacher_ratings for insert with check (auth.uid() = user_id);
create policy "teacher_ratings_update_own" on public.teacher_ratings for update using (auth.uid() = user_id);
create policy "teacher_ratings_delete_own" on public.teacher_ratings for delete using (auth.uid() = user_id);

-- 8. REPORTS
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id),
  target_type text not null check (target_type in ('question', 'answer')),
  target_id uuid not null,
  reason text not null,
  created_at timestamptz default now()
);
alter table public.reports enable row level security;
create policy "reports_insert_auth" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reports_select_own" on public.reports for select using (auth.uid() = reporter_id);

-- =====================================================
-- Auto-create profile on signup trigger
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  adjectives text[] := array['Blue','Green','Red','Swift','Calm','Bright','Silent','Happy','Wise','Bold'];
  animals text[] := array['Panda','Tiger','Eagle','Dolphin','Fox','Owl','Bear','Wolf','Hawk','Deer'];
  handle text;
begin
  handle := adjectives[1 + floor(random() * array_length(adjectives, 1))::int]
         || animals[1 + floor(random() * array_length(animals, 1))::int]
         || floor(random() * 1000)::text;

  insert into public.profiles (id, anon_handle)
  values (new.id, handle)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =====================================================
-- toggle_vote RPC
-- Atomically handles insert/update/delete of votes
-- and updates answers.score
-- =====================================================
create or replace function public.toggle_vote(
  p_answer_id uuid,
  p_vote_value smallint
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_value smallint;
  v_new_score int;
  v_user_vote int;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Check existing vote
  select value into v_existing_value
  from public.votes
  where user_id = v_user_id and answer_id = p_answer_id;

  if v_existing_value is not null then
    if v_existing_value = p_vote_value then
      -- Same vote: remove it (toggle off)
      delete from public.votes
      where user_id = v_user_id and answer_id = p_answer_id;

      update public.answers
      set score = score - p_vote_value
      where id = p_answer_id;

      v_user_vote := 0;
    else
      -- Different vote: switch direction (delta = 2 * new_value)
      update public.votes
      set value = p_vote_value
      where user_id = v_user_id and answer_id = p_answer_id;

      update public.answers
      set score = score + (p_vote_value * 2)
      where id = p_answer_id;

      v_user_vote := p_vote_value;
    end if;
  else
    -- No existing vote: insert
    insert into public.votes (user_id, answer_id, value)
    values (v_user_id, p_answer_id, p_vote_value);

    update public.answers
    set score = score + p_vote_value
    where id = p_answer_id;

    v_user_vote := p_vote_value;
  end if;

  -- Get updated score
  select score into v_new_score
  from public.answers
  where id = p_answer_id;

  return json_build_object('score', v_new_score, 'user_vote', v_user_vote);
end;
$$;
