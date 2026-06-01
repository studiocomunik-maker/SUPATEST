"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ChevronDown } from "lucide-react";
import { restaurant } from "../data";
import { getContent } from "@/utils/content";

const DEFAULT_BG =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80";

// Easing "soft" réutilisé
const EASE = [0.22, 1, 0.36, 1] as const;

// Titre révélé mot par mot derrière un masque (overflow hidden + translateY)
function MaskedTitle({ text }: { text: string }) {
  return (
    <h1 className="mt-6 font-serif text-5xl leading-[1.05] md:text-7xl">
      {text.split(" ").map((word, i) => (
        <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-[0.1em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: EASE }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

export default function Hero() {
  const [accroche, setAccroche] = useState(restaurant.baseline);
  const [horaires, setHoraires] = useState(restaurant.hours);
  const [background, setBackground] = useState(DEFAULT_BG);

  const sectionRef = useRef<HTMLElement>(null);

  // Parallaxe : on lit la progression du scroll sur la hauteur du hero.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    getContent(["hero.accroche", "hero.horaires", "hero.background"]).then(
      (c) => {
        if (c["hero.accroche"]) setAccroche(c["hero.accroche"]);
        if (c["hero.horaires"]) setHoraires(c["hero.horaires"]);
        if (c["hero.background"]) setBackground(c["hero.background"]);
      },
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden grain"
    >
      {/* Fond : parallaxe (motion) sur le conteneur, Ken Burns (CSS) sur l'image */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <div
          className="hero-kenburns absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${background}')` }}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink/80" />
      <div className="absolute inset-0 bg-wine-dark/20 mix-blend-multiply" />

      {/* Contenu : translation + fondu au scroll */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center text-ivory"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-sm uppercase tracking-[0.32em] text-gold-light"
        >
          {restaurant.tagline}
        </motion.p>

        <MaskedTitle text={restaurant.name} />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
          className="mx-auto mt-6 max-w-xl text-lg text-ivory/85"
        >
          {accroche}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: EASE }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#reservation"
            className="btn-shine rounded-full bg-gold px-8 py-3 font-medium text-ink transition-transform hover:scale-[1.03]"
          >
            Réserver une table
          </a>
          <a
            href="#menu"
            className="rounded-full border border-ivory/40 px-8 py-3 font-medium text-ivory transition-colors hover:bg-ivory/10"
          >
            Découvrir la carte
          </a>
        </motion.div>
      </motion.div>

      {/* Bas : horaires + indicateur de scroll animé */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
          {horaires}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-ivory/50"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </div>
    </section>
  );
}
