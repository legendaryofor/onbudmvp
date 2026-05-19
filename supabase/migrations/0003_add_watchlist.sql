ALTER TABLE public.users ADD COLUMN IF NOT EXISTS watchlist text[] DEFAULT ARRAY[]::text[];
