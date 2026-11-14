REVOKE UPDATE ON public.participant_messages FROM authenticated;
GRANT UPDATE (reply) ON public.participant_messages TO authenticated;