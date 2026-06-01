"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { createClient } from "@/utils/supabase/client";
import Reveal from "./Reveal";

type Photo = {
  id: number;
  image_url: string;
  caption: string | null;
  width: number | null;
  height: number | null;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// Section « Galerie » : lit les photos depuis Supabase (table gallery).
// Si aucune photo, la section ne s'affiche pas (pas de bloc vide sur le site).
export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("gallery")
        .select("id, image_url, caption, width, height")
        .order("position", { ascending: true })
        .order("id", { ascending: true });
      if (data) setPhotos(data);
    })();
  }, []);

  if (photos.length === 0) return null;

  return (
    <section id="galerie" className="bg-ivory py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">
            En images
          </p>
          <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
            La galerie
          </h2>
        </Reveal>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 gap-4 columns-2 md:columns-3"
        >
          {photos.map((p) => (
            <motion.figure
              key={p.id}
              variants={item}
              className="group relative mb-4 block break-inside-avoid overflow-hidden rounded-xl"
            >
              <Image
                src={p.image_url}
                alt={p.caption ?? ""}
                width={p.width ?? 800}
                height={p.height ?? 1000}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {p.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink/80 to-transparent p-4 text-sm text-ivory transition-transform duration-300 group-hover:translate-y-0">
                  {p.caption}
                </figcaption>
              )}
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
