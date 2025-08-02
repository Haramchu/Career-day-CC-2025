import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  console.error('Missing REACT_APP_SUPABASE_URL environment variable');
}
if (!supabaseKey) {
  console.error('Missing REACT_APP_SUPABASE_ANON_KEY environment variable');
}

console.log('Supabase config:', { 
  url: supabaseUrl ? 'Set' : 'Missing', 
  key: supabaseKey ? 'Set' : 'Missing' 
});

export const supabase = createClient(supabaseUrl, supabaseKey)