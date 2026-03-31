import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Project file features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to get public URLs for thumbnails or static project assets
 */
export const getPublicUrl = (path: string, bucket = 'projects') => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
