import { createClient } from "@supabase/supabase-js";

const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseApiKey = import.meta.env.VITE_SUPABASE_API_KEY;

const supabase = createClient(supabaseProjectUrl, supabaseApiKey);

export default supabase;