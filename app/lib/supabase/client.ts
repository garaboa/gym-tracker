import { createClient } from '@supabase/supabase-js'

// Por ahora usamos valores placeholder
// Los cambiaremos cuando configuremos Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)