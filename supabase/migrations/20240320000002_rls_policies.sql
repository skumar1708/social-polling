-- Drop existing policies
drop policy if exists "Anyone can view polls" on polls;
drop policy if exists "Users can create polls" on polls;
drop policy if exists "Users can update their own polls" on polls;
drop policy if exists "Users can delete their own polls" on polls;

drop policy if exists "Anyone can view poll options" on poll_options;
drop policy if exists "Users can create poll options" on poll_options;
drop policy if exists "Users can update options for their polls" on poll_options;
drop policy if exists "Users can delete options for their polls" on poll_options;

drop policy if exists "Anyone can view votes" on votes;
drop policy if exists "Users can create votes" on votes;
drop policy if exists "Users can update their own votes" on votes;
drop policy if exists "Users can delete their own votes" on votes;

-- Enable RLS on all tables
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table votes enable row level security;

-- Policies for polls table
create policy "Anyone can view polls"
  on polls for select
  using (true);

create policy "Users can create polls"
  on polls for insert
  with check (true);  -- Allow API routes to create polls

create policy "Users can update their own polls"
  on polls for update
  using (auth.uid() = user_id);

create policy "Users can delete their own polls"
  on polls for delete
  using (auth.uid() = user_id);

-- Policies for poll_options table
create policy "Anyone can view poll options"
  on poll_options for select
  using (true);

create policy "Users can create poll options"
  on poll_options for insert
  with check (true);  -- Allow API routes to create options

create policy "Users can update options for their polls"
  on poll_options for update
  using (
    exists (
      select 1 from polls
      where polls.id = poll_options.poll_id
      and polls.user_id = auth.uid()
    )
  );

create policy "Users can delete options for their polls"
  on poll_options for delete
  using (
    exists (
      select 1 from polls
      where polls.id = poll_options.poll_id
      and polls.user_id = auth.uid()
    )
  );

-- Policies for votes table
create policy "Anyone can view votes"
  on votes for select
  using (true);

create policy "Users can create votes"
  on votes for insert
  with check (true);  -- Allow API routes to create votes

create policy "Users can update their own votes"
  on votes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own votes"
  on votes for delete
  using (auth.uid() = user_id); 