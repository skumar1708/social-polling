-- Drop existing function if it exists
drop function if exists delete_poll(uuid);
drop function if exists delete_poll(bigint);

-- Create function to delete poll and its related data
create or replace function delete_poll(p_id bigint)
returns void as $$
begin
  -- Delete votes first
  delete from votes where poll_id = p_id;
  
  -- Delete poll options
  delete from poll_options where poll_id = p_id;
  
  -- Finally delete the poll
  delete from polls where id = p_id;
end;
$$ language plpgsql; 