"use client";

import { useEffect, useState } from "react";
import { restaurant } from "../data";

const links = [
  { href: "#produits", label: "Nos produits" },
  { href: "#menu", label: "La carte" },
  { href: "#galerie", label: "Galerie" },
  { href: "#reservation", label: "Réserver" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-ivory/90 backdrop-blur border-b border-ink/10"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className={`font-serif text-xl tracking-wide transition-colors ${
            scrolled ? "text-ink" : "text-ivory"
          }`}
        >
          {restaurant.name}
        </a>

        <ul
          className={`hidden items-center gap-8 text-sm md:flex transition-colors ${
            scrolled ? "text-ink/80" : "text-ivory/90"
          }`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="uppercase tracking-[0.18em] hover:text-gold transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#reservation"
          className="rounded-full bg-wine px-5 py-2 text-sm font-medium text-cream transition-colors hover:bg-wine-dark"
        >
          Réserver
        </a>
      </nav>
    </header>
  );
}
