import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Utiliser la clé Service Role pour un accès complet (upload côté serveur)

if (!supabaseUrl || !supabaseKey) {
  // On ne throw pas d'erreur au build, mais on log un avertissement
  console.warn("⚠️ Les variables d'environnement Supabase ne sont pas définies.");
}

// Client Supabase avec privilèges d'administration (à utiliser UNIQUEMENT côté serveur)
export const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseKey || "",
  {
    auth: {
      persistSession: false,
    },
  }
);
