-- Enable realtime for shared_lists table
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_lists;

-- Enable realtime for user_follows table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_follows;