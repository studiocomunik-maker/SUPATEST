"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { createClient } from "@/utils/supabase/client";
import { getContent } from "@/utils/content";
import { menu as fallbackMenu, MENU_SECTIONS, type MenuSection } from "../data";
import Reveal from "./Reveal";

const tagStyles: Record<string, string> = {
  Signature: "bg-wine text-cream",
  Végétarien: "bg-sage text-cream",
  "De saison": "bg-gold text-ink",
};

const DEFAULT_MENTIONS =
  "Nos plats sont faits maison, selon les produits de saison.";

const EASE = [0.22, 1, 0.36, 1] as const;
// Conteneur qui décale l'apparition de ses enfants (effet cascade)
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function Menu() {
  const [sections, setSections] = useState<MenuSection[]>(fallbackMenu);
  const [mentions, setMentions] = useState(DEFAULT_MENTIONS);

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
    <section id="menu" className="bg-cream py-24 grain">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">À table</p>
          <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
            La carte
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink/65">{mentions}</p>
        </Reveal>

        <div className="mt-16 space-y-14">
          {sections.map((section) => (
            <motion.div
              key={section.title}
              variants={listVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              {/* Titre de section + filet qui se dessine */}
              <h3 className="flex items-center gap-4 font-serif text-2xl text-wine">
                <motion.span variants={itemVariants}>{section.title}</motion.span>
                <motion.span
                  variants={{
                    hidden: { scaleX: 0 },
                    show: { scaleX: 1, transition: { duration: 0.7, ease: EASE } },
                  }}
                  style={{ transformOrigin: "left" }}
                  className="h-px flex-1 bg-ink/15"
                />
              </h3>

              <ul className="mt-6 space-y-6">
                {section.items.map((item) => (
                  <motion.li
                    key={item.name}
                    variants={itemVariants}
                    whileHover={{ x: 6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="group flex items-baseline justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="relative font-medium text-ink after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-wine after:transition-all after:duration-300 group-hover:after:w-full">
                          {item.name}
                        </h4>
                        {item.tag && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${
                              tagStyles[item.tag] ?? "bg-ink/10 text-ink"
                            }`}
                          >
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-ink/60">
                        {item.description}
                      </p>
                    </div>
                    <div className="whitespace-nowrap font-serif text-lg text-wine transition-transform duration-300 group-hover:scale-110">
                      {item.price}&nbsp;€
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
