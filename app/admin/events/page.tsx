"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AdminShell from "../AdminShell";

type Event = {
  id: number;
  title: string;
  description: string | null;
  event_date: string | null;
  image_url: string | null;
};

type Draft = {
  id?: number;
  title: string;
  description: string;
  event_date: string;
  image_url: string;
};

const emptyDraft: Draft = {
  title: "",
  description: "",
  event_date: "",
  image_url: "",
};

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .select("id, title, description, event_date, image_url")
      .order("event_date", { ascending: true });
    if (error) setError(error.message);
    setEvents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !draft) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `events/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setDraft({ ...draft, image_url: data.publicUrl });
    setUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const supabase = createClient();
    const payload = {
      title: draft.title,
      description: draft.description || null,
      event_date: draft.event_date || null,
      image_url: draft.image_url || null,
    };
    const { error } = draft.id
      ? await supabase.from("events").update(payload).eq("id", draft.id)
      : await supabase.from("events").insert(payload);
    if (error) {
      setError(error.message);
      return;
    }
    setDraft(null);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Supprimer cet événement ?")) return;
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", id);
    load();
  }

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Date à définir";

  return (
    <AdminShell title="Événements">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Soirées, dégustations, concerts… affichés sur le site.
          </p>
          {!draft && (
            <button
              onClick={() => setDraft({ ...emptyDraft })}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              Nouvel événement
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">⚠️ {error}</p>}

        {/* Formulaire d'ajout / édition */}
        {draft && (
          <form
            onSubmit={save}
            className="space-y-4 rounded-xl border border-zinc-900/20 bg-zinc-50 p-5"
          >
            <input
              autoFocus
              required
              placeholder="Titre de l'événement"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
            <input
              type="date"
              value={draft.event_date}
              onChange={(e) => setDraft({ ...draft, event_date: e.target.value })}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
            <textarea
              placeholder="Description"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
            <div>
              <span className="mb-1.5 block text-xs font-medium text-zinc-600">
                Image (optionnel)
              </span>
              {draft.image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={draft.image_url}
                  alt=""
                  className="mb-2 h-32 w-full rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-white"
              />
              {uploading && <p className="mt-1 text-xs text-zinc-400">Upload…</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {draft.id ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </form>
        )}

        {/* Liste */}
        {loading ? (
          <p className="text-sm text-zinc-400">Chargement…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-zinc-400">Aucun événement pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-3"
              >
                {ev.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={ev.image_url}
                    alt=""
                    className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-300">
                    —
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">{ev.title}</p>
                  <p className="text-sm text-zinc-500">{fmt(ev.event_date)}</p>
                </div>
                <button
                  onClick={() =>
                    setDraft({
                      id: ev.id,
                      title: ev.title,
                      description: ev.description ?? "",
                      event_date: ev.event_date ?? "",
                      image_url: ev.image_url ?? "",
                    })
                  }
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  title="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(ev.id)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
