import {SupabaseClient} from "@supabase/supabase-js";
import axios from "axios";

export const supabase = SupabaseClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);