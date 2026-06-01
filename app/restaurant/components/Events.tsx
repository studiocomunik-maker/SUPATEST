"use client";

import { useEffect, useState } from "react";
import SafeImage from "./SafeImage";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Reveal from "./Reveal";

type Event = {
  id: number;
  title: string;
  description: string | null;
  event_date: string | null;
  image_url: string | null;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const card = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// Section « Événements » — version premium, fond sombre.
// Affiche les événements à venir (date >= aujourd'hui). Masquée si vide.
export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("events")
        .select("id, title, description, event_date, image_url")
        .or(`event_date.gte.${today},event_date.is.null`)
        .order("event_date", { ascending: true });
      if (data) setEvents(data);
    })();
  }, []);

  if (events.length === 0) return null;

  const fmtDay = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit" }) : "";
  const fmtMonth = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")
      : "Bientôt";

  return (
    <section
      id="evenements"
      className="relative overflow-hidden bg-ink py-28 text-ivory grain"
    >
      {/* Glow doré décoratif */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(ellipse_at_center,_rgba(191,161,90,0.18),_transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 bg-[radial-gradient(circle,_rgba(110,36,54,0.35),_transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-gold-light">
            Agenda
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl">
            Nos événements
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-ivory/55">
            Soirées, dégustations et rendez-vous gourmands.
          </p>
        </Reveal>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {events.map((ev) => (
            <motion.article
              key={ev.id}
              variants={card}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl ring-1 ring-ivory/10 transition-all duration-500 hover:ring-gold/40"
            >
              {/* Fond : image ou dégradé */}
              {ev.image_url ? (
                <SafeImage
                  src={ev.image_url}
                  alt={ev.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  fallbackClassName="absolute inset-0 bg-gradient-to-br from-wine-dark to-ink"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-wine-dark to-ink" />
              )}

              {/* Voile dégradé pour lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent transition-opacity duration-500 group-hover:from-ink/95" />

              {/* Pastille date */}
              <div className="absolute left-5 top-5 flex flex-col items-center rounded-2xl border border-ivory/15 bg-ink/40 px-4 py-2 backdrop-blur-md">
                <span className="font-serif text-2xl leading-none text-ivory">
                  {fmtDay(ev.event_date)}
                </span>
                <span className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-gold-light">
                  {fmtMonth(ev.event_date)}
                </span>
              </div>

              {/* Contenu */}
              <div className="relative z-10 p-6 transition-transform duration-500 group-hover:-translate-y-1">
                <h3 className="font-serif text-2xl leading-tight">{ev.title}</h3>
                {ev.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-ivory/70">
                    {ev.description}
                  </p>
                )}
                <a
                  href="#reservation"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold-light"
                >
                  Réserver
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
