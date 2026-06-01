"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
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
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

// Section « Événements » : affiche les événements à venir (date >= aujourd'hui),
// lus depuis Supabase. Masquée s'il n'y en a aucun.
export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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
    d ? new Date(d).toLocaleDateString("fr-FR", { month: "short" }).replace(".", "") : "à venir";

  return (
    <section id="evenements" className="bg-cream py-24 grain">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Agenda</p>
          <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
            Nos événements
          </h2>
        </Reveal>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {events.map((ev) => (
            <motion.article
              key={ev.id}
              variants={card}
              className="flex flex-col overflow-hidden rounded-2xl bg-ivory shadow-sm ring-1 ring-ink/5"
            >
              {ev.image_url && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ev.image_url}
                    alt={ev.title}
                    className="aspect-[3/2] w-full object-cover"
                  />
                  {/* Pastille date */}
                  <div className="absolute left-4 top-4 flex flex-col items-center rounded-lg bg-wine px-3 py-1.5 text-cream">
                    <span className="font-serif text-xl leading-none">
                      {fmtDay(ev.event_date)}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest">
                      {fmtMonth(ev.event_date)}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                {!ev.image_url && (
                  <p className="mb-2 text-sm font-medium uppercase tracking-widest text-wine">
                    {fmtDay(ev.event_date)} {fmtMonth(ev.event_date)}
                  </p>
                )}
                <h3 className="font-serif text-2xl text-ink">{ev.title}</h3>
                {ev.description && (
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    {ev.description}
                  </p>
                )}
                <a
                  href="#reservation"
                  className="mt-4 inline-block text-sm font-medium text-wine underline-offset-4 hover:underline"
                >
                  Réserver →
                </a>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
