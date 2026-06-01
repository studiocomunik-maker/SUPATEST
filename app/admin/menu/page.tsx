"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getContent } from "@/utils/content";
import { MENU_SECTIONS, MENU_TAGS } from "@/app/restaurant/data";
import AdminShell from "../AdminShell";

type Item = {
  id: number;
  section: string;
  name: string;
  description: string | null;
  price: string | null;
  tag: string | null;
};

// Brouillon d'édition (id absent = nouvel ajout)
type Draft = {
  id?: number;
  section: string;
  name: string;
  description: string;
  price: string;
  tag: string;
};

export default function MenuAdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [mentions, setMentions] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("menu_items")
      .select("id, section, name, description, price, tag")
      .order("id", { ascending: true });
    setItems(data ?? []);
    const c = await getContent(["menu.mentions"]);
    setMentions(c["menu.mentions"] ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const supabase = createClient();
    const payload = {
      section: draft.section,
      name: draft.name,
      description: draft.description || null,
      price: draft.price || null,
      tag: draft.tag || null,
    };

    const { error } = draft.id
      ? await supabase.from("menu_items").update(payload).eq("id", draft.id)
      : await supabase.from("menu_items").insert(payload);

    if (error) {
      setStatus(`Erreur : ${error.message}`);
      return;
    }
    setDraft(null);
    setStatus(null);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Supprimer ce plat ?")) return;
    const supabase = createClient();
    await supabase.from("menu_items").delete().eq("id", id);
    load();
  }

  async function saveMentions() {
    const supabase = createClient();
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: "menu.mentions", value: mentions }, { onConflict: "key" });
    setStatus(error ? `Erreur : ${error.message}` : "Mentions enregistrées ✅");
  }

  // Formulaire d'édition/ajout (un seul affiché à la fois)
  const formEl = draft && (
    <form
      onSubmit={saveDraft}
      className="space-y-3 rounded-lg border border-zinc-900/20 bg-zinc-50 p-4"
    >
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <input
          autoFocus
          required
          placeholder="Nom du plat"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
        <input
          placeholder="Prix"
          value={draft.price}
          onChange={(e) => setDraft({ ...draft, price: e.target.value })}
          className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>
      <textarea
        placeholder="Description"
        rows={2}
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
      />
      <div className="flex items-center gap-3">
        <select
          value={draft.tag}
          onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        >
          <option value="">Sans tag</option>
          {MENU_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {draft.id ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <AdminShell title="Menu">
      <div className="mx-auto max-w-2xl space-y-10">
        {loading ? (
          <p className="text-sm text-zinc-400">Chargement…</p>
        ) : (
          <>
            {MENU_SECTIONS.map((section) => {
              const sectionItems = items.filter((i) => i.section === section);
              return (
                <section key={section}>
                  <h2 className="mb-3 text-lg font-semibold text-zinc-900">
                    {section}
                  </h2>
                  <ul className="space-y-2">
                    {sectionItems.map((item) =>
                      draft?.id === item.id ? (
                        <li key={item.id}>{formEl}</li>
                      ) : (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-900">
                                {item.name}
                              </span>
                              {item.tag && (
                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                                  {item.tag}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="truncate text-sm text-zinc-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-medium text-zinc-700">
                            {item.price ? `${item.price} €` : "—"}
                          </span>
                          <button
                            onClick={() =>
                              setDraft({
                                id: item.id,
                                section: item.section,
                                name: item.name,
                                description: item.description ?? "",
                                price: item.price ?? "",
                                tag: item.tag ?? "",
                              })
                            }
                            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => remove(item.id)}
                            className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ),
                    )}
                  </ul>

                  {/* Formulaire d'ajout pour cette section */}
                  {draft && !draft.id && draft.section === section ? (
                    <div className="mt-2">{formEl}</div>
                  ) : (
                    <button
                      onClick={() =>
                        setDraft({
                          section,
                          name: "",
                          description: "",
                          price: "",
                          tag: "",
                        })
                      }
                      className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un plat
                    </button>
                  )}
                </section>
              );
            })}

            {/* Mentions bas de carte */}
            <section className="border-t border-zinc-200 pt-8">
              <h2 className="mb-1 text-lg font-semibold text-zinc-900">
                Mentions (bas de carte)
              </h2>
              <p className="mb-3 text-sm text-zinc-500">
                Phrase affichée sous la carte (ex. « faits maison, produits de
                saison »).
              </p>
              <textarea
                value={mentions}
                onChange={(e) => setMentions(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={saveMentions}
                  className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Enregistrer les mentions
                </button>
                {status && (
                  <span className="text-sm text-zinc-600">{status}</span>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}
