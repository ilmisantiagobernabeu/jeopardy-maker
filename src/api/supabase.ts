import { createClient } from "@supabase/supabase-js";

const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;
export const supabase = createClient(
  "https://dygtncdmjncgiujlmlqb.supabase.co",
  supabaseKey
);
