-- Create function to increment vote count
create or replace function increment_vote_count(option_id uuid)
returns void as $$
begin
  update poll_options
  set votes = votes + 1
  where id = option_id;
end;
$$ language plpgsql;

-- Create function to decrement vote count
create or replace function decrement_vote_count(option_id uuid)
returns void as $$
begin
  update poll_options
  set votes = votes - 1
  where id = option_id;
end;
$$ language plpgsql; 