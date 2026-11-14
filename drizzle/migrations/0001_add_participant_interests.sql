CREATE TABLE public.participant_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id text NOT NULL CHECK (char_length(event_id) <= 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);
GRANT SELECT, INSERT, DELETE ON public.participant_interests TO authenticated;
GRANT ALL ON public.participant_interests TO service_role;
ALTER TABLE public.participant_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read own interests" ON public.participant_interests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Participants add own interests" ON public.participant_interests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Participants remove own interests" ON public.participant_interests FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Coordinators read participant interests" ON public.participant_interests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'coordinator'));