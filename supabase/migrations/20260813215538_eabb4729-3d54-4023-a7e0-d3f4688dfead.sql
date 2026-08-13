CREATE TABLE public.verita_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT ALL ON public.verita_subscribers TO service_role;
ALTER TABLE public.verita_subscribers ENABLE ROW LEVEL SECURITY;