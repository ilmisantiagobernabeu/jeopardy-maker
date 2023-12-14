import { createClient } from "@supabase/supabase-js";

const serviceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE as string;
export const adminSupabase = createClient(
  "https://dygtncdmjncgiujlmlqb.supabase.co",
  serviceRole
);
