import { restaurant } from "../data";

export default function Footer() {
  return (
    <footer className="bg-wine-dark py-12 text-cream/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <p className="font-serif text-2xl text-cream">{restaurant.name}</p>
        <p className="text-sm uppercase tracking-[0.3em] text-gold-light">
          {restaurant.tagline}
        </p>
        <p className="text-sm text-cream/60">
          {restaurant.address} · {restaurant.phone}
        </p>
        <p className="mt-4 text-xs text-cream/40">
          © {restaurant.name} — Démo Pixelstore · contenu bientôt piloté par Supabase
        </p>
      </div>
    </footer>
  );
}
