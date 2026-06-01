"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getContent } from "@/utils/content";
import AdminShell from "../AdminShell";
import { SkeletonForm } from "../Skeleton";

// Clés gérées par cette section.
const KEYS = ["hero.accroche", "hero.horaires", "hero.background"];

export default function HeroAdminPage() {
  const [accroche, setAccroche] = useState("");
  const [horaires, setHoraires] = useState("");
  const [background, setBackground] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Chargement des valeurs actuelles
  useEffect(() => {
    getContent(KEYS).then((c) => {
      setAccroche(c["hero.accroche"] ?? "");
      setHoraires(c["hero.horaires"] ?? "");
      setBackground(c["hero.background"] ?? "");
      setLoading(false);
    });
  }, []);

  // Upload d'une nouvelle image de fond vers Supabase Storage
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `hero/background-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (error) {
      setStatus(`Erreur upload : ${error.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setBackground(data.publicUrl);
    setUploading(false);
  }

  // Enregistrement : upsert des 3 variables
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const supabase = createClient();
    const { error } = await supabase.from("site_content").upsert(
      [
        { key: "hero.accroche", value: accroche },
        { key: "hero.horaires", value: horaires },
        { key: "hero.background", value: background },
      ],
      { onConflict: "key" },
    );

    setSaving(false);
    setStatus(error ? `Erreur : ${error.message}` : "Enregistré ✅");
  }

  return (
    <AdminShell title="Hero">
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 text-sm text-zinc-500">
          Section d&apos;accueil du site. Les modifications sont visibles en
          ligne au prochain rafraîchissement.
        </p>

        {loading ? (
          <SkeletonForm />
        ) : (
          <form
            onSubmit={handleSave}
            className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6"
          >
            {/* Image de fond */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Image de fond
              </label>
              {background && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={background}
                  alt="Aperçu du fond hero"
                  className="mb-3 h-40 w-full rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-white"
              />
              {uploading && (
                <p className="mt-2 text-sm text-zinc-400">Upload en cours…</p>
              )}
            </div>

            {/* Accroche */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Accroche
              </label>
              <textarea
                value={accroche}
                onChange={(e) => setAccroche(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
              />
            </div>

            {/* Horaires */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Horaires d&apos;ouverture
              </label>
              <input
                type="text"
                value={horaires}
                onChange={(e) => setHoraires(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={saving || uploading}
                className="rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              {status && <span className="text-sm text-zinc-600">{status}</span>}
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
