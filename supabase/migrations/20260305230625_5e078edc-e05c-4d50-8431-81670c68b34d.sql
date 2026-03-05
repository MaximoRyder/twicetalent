
CREATE TABLE public.solicitudes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_brand INTEGER,
  website INTEGER,
  clarity INTEGER,
  validation INTEGER,
  funding BOOLEAN,
  budget TEXT,
  urgency INTEGER,
  readiness_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert solicitudes"
  ON public.solicitudes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated can read solicitudes"
  ON public.solicitudes
  FOR SELECT
  TO authenticated
  USING (true);
