import { createClient } from "@/utils/supabase/client";

// Browser-side Supabase client — used by client components and the store.
export const supabase = createClient();
