"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AdminShell from "../AdminShell";
import { SkeletonGrid } from "../Skeleton";

type Photo = {
  id: number;
  image_url: string;
  caption: string | null;
};

export default function GalleryAdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("gallery")
      .select("id, image_url, caption")
      .order("position", { ascending: true })
      .order("id", { ascending: true });
    if (error) setError(error.message);
    setPhotos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Upload d'une ou plusieurs images → Storage → 1 ligne par image
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `gallery/${Date.now()}-${i}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, file, { upsert: true });
      if (upErr) {
        setError(`Erreur upload : ${upErr.message}`);
        continue;
      }
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      // Lit les dimensions réelles de l'image (pour next/image + masonry sans CLS)
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new window.Image();
        img.onload = () =>
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 0, h: 0 });
        img.src = URL.createObjectURL(file);
      });
      const { error: insErr } = await supabase.from("gallery").insert({
        image_url: data.publicUrl,
        caption: "",
        width: dims.w || null,
        height: dims.h || null,
      });
      if (insErr) setError(`Erreur enregistrement : ${insErr.message}`);
    }

    setUploading(false);
    e.target.value = ""; // reset l'input
    load();
  }

  async function saveCaption(id: number, caption: string) {
    const supabase = createClient();
    await supabase.from("gallery").update({ caption }).eq("id", id);
  }

  async function remove(id: number) {
    if (!confirm("Supprimer cette photo ?")) return;
    const supabase = createClient();
    await supabase.from("gallery").delete().eq("id", id);
    load();
  }

  return (
    <AdminShell title="Galerie">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-sm text-zinc-500">
          Photos affichées dans la section « Galerie » du site. Tu peux en
          sélectionner plusieurs d&apos;un coup.
        </p>

        {/* Zone d'upload */}
        <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-white py-10 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700">
          <Upload className="h-5 w-5" />
          {uploading ? "Upload en cours…" : "Cliquer pour ajouter des photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {error && <p className="text-sm text-red-600">⚠️ {error}</p>}

        {/* Grille des photos */}
        {loading ? (
          <SkeletonGrid items={6} />
        ) : photos.length === 0 ? (
          <p className="text-sm text-zinc-400">Aucune photo pour l&apos;instant.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url}
                    alt={p.caption ?? ""}
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    onClick={() => remove(p.id)}
                    className="absolute right-1.5 top-1.5 rounded-md bg-white/90 p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  defaultValue={p.caption ?? ""}
                  placeholder="Légende (optionnel)"
                  onBlur={(e) => saveCaption(p.id, e.target.value)}
                  className="w-full border-t border-zinc-100 px-2 py-1.5 text-xs outline-none focus:bg-zinc-50"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
