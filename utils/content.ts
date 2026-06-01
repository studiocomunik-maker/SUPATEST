import { createClient } from "@/utils/supabase/client";

// Lit un lot de variables de contenu (table clé/valeur `site_content`)
// et renvoie un objet { clé: valeur }. Utilisé par le front ET le back-office.
export async function getContent(
  keys: string[],
): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("key, value")
    .in("key", keys);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const row of data) {
    if (row.value != null) map[row.key] = row.value;
  }
  return map;
}
