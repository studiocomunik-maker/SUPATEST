"use client";

import AdminShell from "./AdminShell";

// Tableau de bord (vide pour l'instant).
// On ajoutera ici les blocs d'édition (textes, images…) à la demande.
export default function AdminPage() {
  return (
    <AdminShell title="Tableau de bord">
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white/50">
        <div className="max-w-md text-center">
          <p className="text-lg font-medium text-zinc-700">Bienvenue</p>
          <p className="mt-2 text-sm text-zinc-500">
            Choisis une section dans la barre latérale pour en éditer le
            contenu. On commence par <strong>Hero</strong>.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
