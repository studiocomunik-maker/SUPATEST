"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { createClient } from "@/utils/supabase/client";
import { getContent } from "@/utils/content";
import { MENU_SECTIONS, type MenuSection } from "../data";
import Reveal from "./Reveal";

const tagStyles: Record<string, string> = {
  Signature: "border-wine/40 text-wine",
  Végétarien: "border-sage/50 text-sage",
  "De saison": "border-gold/60 text-gold-dark",
};

const EASE = [0.22, 1, 0.36, 1] as const;
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function Menu({
  initialSections,
  initialMentions,
}: {
  initialSections: MenuSection[];
  initialMentions: string;
}) {
  // Données fournies par le serveur (vraies, fraîches via ISR).
  // Le re-fetch client ci-dessous les met à jour à l'instant si tu édites le back-office.
  const [sections, setSections] = useState<MenuSection[]>(initialSections);
  const [mentions, setMentions] = useState(initialMentions);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("menu_items")
        .select("section, name, description, price, tag")
        .order("id", { ascending: true });

      if (data && data.length > 0) {
        const grouped: MenuSection[] = MENU_SECTIONS.map((title) => ({
          title,
          items: data
            .filter((r) => r.section === title)
            .map((r) => ({
              name: r.name,
              description: r.description ?? "",
              price: r.price ?? "",
              tag: (r.tag ?? undefined) as MenuSection["items"][number]["tag"],
            })),
        })).filter((s) => s.items.length > 0);
        if (grouped.length > 0) setSections(grouped);
      }

      const c = await getContent(["menu.mentions"]);
      if (c["menu.mentions"]) setMentions(c["menu.mentions"]);
    })();
  }, []);

  return (
    <section id="menu" className="bg-cream py-28 grain">
      <div className="mx-auto max-w-3xl px-6">
        {/* En-tête */}
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">À table</p>
          <h2 className="mt-4 font-serif text-4xl text-ink md:text-6xl">
            La carte
          </h2>
          {/* Ornement doré */}
          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gold/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <p className="mx-auto mt-6 max-w-md font-serif text-lg italic text-ink/55">
            {mentions}
          </p>
        </Reveal>

        {/* Carte encadrée (effet papier) */}
        <div className="mt-14 rounded-2xl border border-ink/10 bg-ivory/70 px-7 py-12 shadow-sm md:px-14 md:py-16">
          <div className="space-y-14">
            {sections.map((section) => (
              <motion.div
                key={section.title}
                variants={listVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
              >
                {/* Titre de section centré avec filets dorés */}
                <motion.div
                  variants={itemVariants}
                  className="mb-8 flex items-center justify-center gap-4"
                >
                  <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/60" />
                  <h3 className="font-serif text-2xl text-wine md:text-3xl">
                    {section.title}
                  </h3>
                  <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/60" />
                </motion.div>

                <ul className="space-y-7">
                  {section.items.map((item) => (
                    <motion.li
                      key={item.name}
                      variants={itemVariants}
                      className="group"
                    >
                      <div className="flex items-end gap-3">
                        <h4 className="font-serif text-lg text-ink transition-colors group-hover:text-wine">
                          {item.name}
                        </h4>
                        {item.tag && (
                          <span
                            className={`mb-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                              tagStyles[item.tag] ?? "border-ink/20 text-ink/60"
                            }`}
                          >
                            {item.tag}
                          </span>
                        )}
                        {/* Ligne pointillée (leader) reliant le plat au prix */}
                        <span className="mb-2 flex-1 border-b border-dotted border-ink/25" />
                        <span className="whitespace-nowrap font-serif text-lg text-wine">
                          {item.price}&nbsp;€
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-1.5 max-w-[88%] text-sm leading-relaxed text-ink/55">
                          {item.description}
                        </p>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
