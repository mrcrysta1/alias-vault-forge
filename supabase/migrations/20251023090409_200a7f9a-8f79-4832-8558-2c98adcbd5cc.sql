-- Create aliases table
CREATE TABLE IF NOT EXISTS public.aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alias TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries on unused aliases
CREATE INDEX IF NOT EXISTS idx_aliases_used ON public.aliases(used) WHERE used = false;
CREATE INDEX IF NOT EXISTS idx_aliases_token ON public.aliases(token);

-- Enable Row Level Security (public access for this tool)
ALTER TABLE public.aliases ENABLE ROW LEVEL SECURITY;

-- Allow public read access to unused aliases
CREATE POLICY "Anyone can view unused aliases"
  ON public.aliases
  FOR SELECT
  USING (used = false);

-- Allow public insert for generation
CREATE POLICY "Anyone can create aliases"
  ON public.aliases
  FOR INSERT
  WITH CHECK (true);

-- Allow public update for marking as used
CREATE POLICY "Anyone can mark aliases as used"
  ON public.aliases
  FOR UPDATE
  USING (true)
  WITH CHECK (used = true);