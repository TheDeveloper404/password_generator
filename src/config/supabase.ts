import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Whether Supabase cloud features are available.
 * When env vars are missing, the app runs in offline-only mode.
 */
export const isCloudEnabled =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl !== 'https://YOUR_PROJECT.supabase.co';

/**
 * Supabase client singleton.
 * Only created when cloud is enabled; otherwise null.
 */
export const supabase = isCloudEnabled
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : null;
