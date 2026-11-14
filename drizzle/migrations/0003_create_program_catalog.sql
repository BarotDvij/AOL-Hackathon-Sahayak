CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  level text NOT NULL CHECK (level IN ('entry', 'youth', 'graduate', 'advanced')),
  prerequisite_text text NOT NULL,
  ages text NOT NULL,
  format text NOT NULL,
  where_offered_na text NOT NULL,
  online_option text NOT NULL CHECK (online_option IN ('yes', 'some_regions', 'no', 'unconfirmed')),
  main_practices text NOT NULL,
  home_practice text NOT NULL,
  suggested_timing text NOT NULL,
  journey_milestone text NOT NULL,
  unlocks_next_text text NOT NULL,
  varies_by_country text NOT NULL CHECK (varies_by_country IN ('no', 'somewhat', 'yes', 'unconfirmed')),
  source_url text,
  needs_local_check boolean NOT NULL GENERATED ALWAYS AS (varies_by_country IN ('yes', 'unconfirmed') OR online_option = 'unconfirmed') STORED,
  min_age integer NOT NULL CHECK (min_age >= 0)
);
GRANT SELECT ON public.programs TO anon, authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read programs" ON public.programs FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.program_prerequisites (
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  requires_program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE RESTRICT,
  min_count integer NOT NULL DEFAULT 1 CHECK (min_count > 0),
  notes text,
  PRIMARY KEY (program_id, requires_program_id),
  CHECK (program_id <> requires_program_id)
);
GRANT SELECT ON public.program_prerequisites TO anon, authenticated;
GRANT ALL ON public.program_prerequisites TO service_role;
ALTER TABLE public.program_prerequisites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read program prerequisites" ON public.program_prerequisites FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX program_prerequisites_requires_idx ON public.program_prerequisites(requires_program_id);