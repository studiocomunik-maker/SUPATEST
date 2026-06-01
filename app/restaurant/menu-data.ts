import { createClient } from "@supabase/supabase-js";
import { menu as fallbackMenu, MENU_SECTIONS, type MenuSection } from "./data";

const DEFAULT_MENTIONS =
  "Nos plats sont faits maison, selon les produits de saison.";

// Récupération du menu CÔTÉ SERVEUR (lecture publique, clé publishable).
// → les vraies données sont dans le HTML (SEO, pas de flash, pas de plat manquant).
// Repli sur data.ts seulement si Supabase est indisponible / base vide.
export async function fetchMenuData(): Promise<{
  sections: MenuSection[];
  mentions: string;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { sections: fallbackMenu, mentions: DEFAULT_MENTIONS };

  try {
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("menu_items")
      .select("section, name, description, price, tag")
      .order("id", { ascending: true });

    let sections = fallbackMenu;
    if (data && data.length > 0) {
      const grouped: MenuSection[] = MENU_SECTIONS.map((title) => ({
        title,
        items: data
          .filter((r) => r.section === title)
          .map((r) => ({
            name: r.name as string,
            description: (r.description as string) ?? "",
            price: (r.price as string) ?? "",
            tag: (r.tag ?? undefined) as MenuSection["items"][number]["tag"],
          })),
      })).filter((s) => s.items.length > 0);
      if (grouped.length > 0) sections = grouped;
    }

    const { data: m } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "menu.mentions")
      .maybeSingle();

    return { sections, mentions: m?.value || DEFAULT_MENTIONS };
  } catch {
    return { sections: fallbackMenu, mentions: DEFAULT_MENTIONS };
  }
}
