CREATE TYPE public.app_role AS ENUM ('participant', 'coordinator');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'display_name', ''));
  RETURN new;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.participant_accounts (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_id text NOT NULL UNIQUE CHECK (participant_id ~ '^p[0-9]{2}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.participant_accounts TO authenticated;
GRANT ALL ON public.participant_accounts TO service_role;
ALTER TABLE public.participant_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read own link" ON public.participant_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Participants claim one sample identity" ON public.participant_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Participants receive only participant role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'participant');

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

CREATE TABLE public.sahayak_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  scope text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
GRANT ALL ON public.sahayak_keys TO service_role;
ALTER TABLE public.sahayak_keys ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sahayak_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id uuid REFERENCES public.sahayak_keys(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  tool text NOT NULL CHECK (char_length(tool) <= 100),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.sahayak_audit TO authenticated;
GRANT ALL ON public.sahayak_audit TO service_role;
ALTER TABLE public.sahayak_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read own audit" ON public.sahayak_audit FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Participants record own tool calls" ON public.sahayak_audit FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'participant' AND key_id IS NULL);

CREATE TABLE public.participant_onboarding (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(answers) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.participant_onboarding TO authenticated;
GRANT ALL ON public.participant_onboarding TO service_role;
ALTER TABLE public.participant_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read own onboarding" ON public.participant_onboarding FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Participants save own onboarding" ON public.participant_onboarding FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Participants update own onboarding" ON public.participant_onboarding FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.practice_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  practiced_on date NOT NULL DEFAULT current_date,
  minutes integer CHECK (minutes IS NULL OR (minutes >= 1 AND minutes <= 600)),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, practiced_on)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_logs TO authenticated;
GRANT ALL ON public.practice_logs TO service_role;
ALTER TABLE public.practice_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read own practice" ON public.practice_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Participants log own practice" ON public.practice_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Participants update own practice" ON public.practice_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Participants delete own practice" ON public.practice_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.participant_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period text NOT NULL CHECK (period IN ('quarter', 'year')),
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.participant_goals TO authenticated;
GRANT ALL ON public.participant_goals TO service_role;
ALTER TABLE public.participant_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read own goals" ON public.participant_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Participants create own goals" ON public.participant_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Participants delete own goals" ON public.participant_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.participant_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_id text NOT NULL,
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 4000),
  source text NOT NULL DEFAULT 'via Muse' CHECK (source IN ('via Muse', 'participant app')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.participant_summaries TO authenticated;
GRANT ALL ON public.participant_summaries TO service_role;
ALTER TABLE public.participant_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read own summaries" ON public.participant_summaries FOR SELECT TO authenticated USING (auth.uid() = user_id AND participant_id = (SELECT participant_id FROM public.participant_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Participants submit own summaries" ON public.participant_summaries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND participant_id = (SELECT participant_id FROM public.participant_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Coordinators read Muse summaries" ON public.participant_summaries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'coordinator'));

CREATE TABLE public.participant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id text NOT NULL,
  suggestion_id text,
  coordinator_name text NOT NULL,
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 4000),
  sent_at timestamptz NOT NULL DEFAULT now(),
  reply text CHECK (reply IS NULL OR reply IN ('join', 'not now'))
);
GRANT SELECT, INSERT, UPDATE ON public.participant_messages TO authenticated;
GRANT ALL ON public.participant_messages TO service_role;
ALTER TABLE public.participant_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read own approved messages" ON public.participant_messages FOR SELECT TO authenticated USING (participant_id = (SELECT participant_id FROM public.participant_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Participants reply to own messages" ON public.participant_messages FOR UPDATE TO authenticated USING (participant_id = (SELECT participant_id FROM public.participant_accounts WHERE user_id = auth.uid())) WITH CHECK (participant_id = (SELECT participant_id FROM public.participant_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Coordinators read approved messages" ON public.participant_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'coordinator'));
CREATE POLICY "Coordinators approve messages" ON public.participant_messages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'coordinator'));

INSERT INTO public.participant_messages (participant_id, suggestion_id, coordinator_name, text, sent_at, reply) VALUES
  ('p05', NULL, 'Meera', 'Hi Priya, it was lovely to see you at the course. Our weekly follow-up is a gentle way to keep the practice going. You would be very welcome.

Warmly, Meera', now() - interval '20 days', 'join'),
  ('p10', NULL, 'Meera', 'Hi Ravi, just thinking of you and hoping your practice is bringing you some ease this month. No need to reply.

Meera', now() - interval '16 days', NULL),
  ('p14', NULL, 'Meera', 'Hi Neha, it was lovely to see you at the course. Our weekly follow-up is a gentle way to keep the practice going. You would be very welcome.

Warmly, Meera', now() - interval '12 days', 'join'),
  ('p19', NULL, 'Meera', 'Hi Arjun, thank you for the care you bring to the follow-up sessions. Your welcome makes a real difference.

Warmly, Meera', now() - interval '8 days', NULL),
  ('p23', NULL, 'Meera', 'Hi Elena, just thinking of you. You would be very welcome at the next online group session whenever the time feels right.

Warmly, Meera', now() - interval '5 days', NULL);