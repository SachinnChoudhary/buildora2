import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase.from('custom_requests').select('*').limit(1);
  console.log('Select:', data?.length, error);

  if (data && data.length > 0) {
    const id = data[0].id;
    const { data: upData, error: upError } = await supabase.from('custom_requests').update({ title: 'Test Update' }).eq('id', id).select();
    console.log('Update:', upData, upError);
  }
}
run();
