import Image from "next/image";
import { featuredDishes } from "../data";
import Reveal from "./Reveal";

// Section « Produits en avant » : 3 plats signature mis en valeur.
export default function Features() {
  return (
    <section id="produits" className="bg-ivory py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">
            La maison
          </p>
          <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
            Nos produits en avant
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink/65">
            Une sélection courte, renouvelée au fil des saisons et des arrivages
            de nos producteurs.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {featuredDishes.map((dish, i) => (
            <Reveal key={dish.name} delay={i * 0.12}>
              <article className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-5 font-serif text-2xl text-ink">
                  {dish.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  {dish.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
