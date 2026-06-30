import { createClient } from '@supabase/supabase-js';

const isUrlValid = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const supabaseUrl = isUrlValid(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  ? (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  : 'https://dummy-project-placeholder.supabase.co';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-placeholder';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase environment variables are missing. Using dummy placeholders for compilation.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
