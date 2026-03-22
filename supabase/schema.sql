-- ============================================================
-- PassGen Multi-Tenant Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Encrypted vault storage (one per user)
-- The server NEVER sees plaintext passwords.
-- All encryption/decryption happens client-side (AES-256-GCM).
CREATE TABLE IF NOT EXISTS public.vaults (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  encrypted_blob TEXT NOT NULL,   -- Base64-encoded AES-256-GCM ciphertext
  iv         TEXT NOT NULL,       -- Base64-encoded initialization vector
  salt       TEXT NOT NULL,       -- Base64-encoded PBKDF2 salt
  version    INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)                 -- Each user has exactly one vault row
);

-- ────────────────────────────────────────────────────────
-- Row Level Security — users can only touch their own row
-- ────────────────────────────────────────────────────────
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;

-- SELECT: user can read their own vault
CREATE POLICY "Users read own vault"
  ON public.vaults FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: user can create their vault
CREATE POLICY "Users create own vault"
  ON public.vaults FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: user can update their vault
CREATE POLICY "Users update own vault"
  ON public.vaults FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: user can delete their vault
CREATE POLICY "Users delete own vault"
  ON public.vaults FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────
-- Auto-update the updated_at timestamp
-- ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.vaults
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ────────────────────────────────────────────────────────
-- Enable Realtime for cross-device sync
-- Supabase Realtime will broadcast UPDATE events to
-- subscribed clients so they can pull the latest vault.
-- ────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.vaults;

-- ────────────────────────────────────────────────────────
-- Self-delete account RPC
-- SECURITY DEFINER so it runs with elevated privileges.
-- Users can only delete their own account (auth.uid()).
-- The ON DELETE CASCADE on vaults.user_id auto-cleans vault data.
-- ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;
