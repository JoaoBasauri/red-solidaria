import { createClient } from '@supabase/supabase-js'
import { isPasswordFlow } from '../utils/passwordFlow.mjs'

// Recordar el destino antes de que Supabase consuma y limpie el enlace.
export const initialPasswordFlow = isPasswordFlow(window.location.hash)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
