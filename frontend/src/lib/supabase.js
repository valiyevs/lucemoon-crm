import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pwcxrbuyfdldudqawcuf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3Y3hyYnV5ZmRsZHVkcWF3Y3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNjIyMjIsImV4cCI6MjA5MTczODIyMn0.LLcV52lZFAGxucyGcdULPCRliaoFqY94jLxoTBLo-W4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
})

export default supabase
