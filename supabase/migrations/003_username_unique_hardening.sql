-- Belt-and-suspenders username uniqueness (idempotent)
-- Primary schema already defines username text unique not null.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_username_key'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON public.users (username);
