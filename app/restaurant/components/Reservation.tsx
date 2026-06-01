"use client";

import { useState } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { restaurant } from "../data";

// Section CTA « Réservation / Contact ».
// À la soumission : insert dans la table `reservations` (côté navigateur, RLS
// autorise l'insertion publique). Les demandes apparaissent dans le back-office.
export default function Reservation() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("");
  const [phone, setPhone] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("reservations").insert({
      name,
      date: date || null,
      time: time || null,
      guests: guests ? Number(guests) : null,
      phone,
    });

    setSending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  function reset() {
    setName("");
    setDate("");
    setTime("");
    setGuests("");
    setPhone("");
    setSent(false);
  }

  return (
    <section id="reservation" className="bg-ink py-24 text-ivory grain">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2">
        {/* Colonne gauche : invitation + infos de contact */}
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold-light">
            Réservation &amp; contact
          </p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">
            Réservez votre table
          </h2>
          <p className="mt-4 max-w-md text-ivory/70">
            Pour les groupes de plus de 8 couverts ou les événements privés,
            appelez-nous directement, nous composerons un menu sur mesure.
          </p>

          <ul className="mt-10 space-y-5 text-ivory/85">
            <li className="flex items-start gap-4">
              <MapPin className="mt-0.5 h-5 w-5 text-gold-light" />
              <span>{restaurant.address}</span>
            </li>
            <li className="flex items-start gap-4">
              <Phone className="mt-0.5 h-5 w-5 text-gold-light" />
              <a
                href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                className="hover:text-gold"
              >
                {restaurant.phone}
              </a>
            </li>
            <li className="flex items-start gap-4">
              <Clock className="mt-0.5 h-5 w-5 text-gold-light" />
              <span>{restaurant.hours}</span>
            </li>
          </ul>
        </div>

        {/* Colonne droite : le formulaire */}
        <div className="rounded-2xl bg-ivory/5 p-8 ring-1 ring-ivory/10">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-serif text-3xl text-gold-light">Merci !</p>
              <p className="mt-3 text-ivory/75">
                Votre demande de réservation a bien été envoyée. Nous revenons
                vers vous rapidement pour confirmer.
              </p>
              <button
                onClick={reset}
                className="mt-6 text-sm uppercase tracking-[0.2em] text-gold-light hover:text-gold"
              >
                Nouvelle demande
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Nom"
                type="text"
                placeholder="Votre nom"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Field
                  label="Heure"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Couverts"
                  type="number"
                  placeholder="2"
                  required
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                />
                <Field
                  label="Téléphone"
                  type="tel"
                  placeholder="06…"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-300">⚠️ {error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="mt-2 w-full rounded-full bg-gold py-3 font-medium text-ink transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {sending ? "Envoi…" : "Envoyer ma demande"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-ivory/60">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-ivory/15 bg-ivory/5 px-4 py-2.5 text-ivory placeholder:text-ivory/30 outline-none focus:border-gold-light"
      />
    </label>
  );
}
