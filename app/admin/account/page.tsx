"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AdminShell from "../AdminShell";

type AdminUser = { id: string; email: string | null; created_at: string };

export default function AccountAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Appelle l'Edge Function (le token de session est joint automatiquement)
  const call = useCallback(async (body: Record<string, unknown>) => {
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body,
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await call({ action: "list" });
      setUsers(data.users ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await call({ action: "create", email, password });
      setEmail("");
      setPassword("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de création");
    } finally {
      setCreating(false);
    }
  }

  async function deleteUser(id: string, label: string | null) {
    if (!confirm(`Supprimer le compte ${label ?? id} ?`)) return;
    setError(null);
    try {
      await call({ action: "delete", userId: id });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de suppression");
    }
  }

  return (
    <AdminShell title="Espace compte">
      <div className="mx-auto max-w-2xl space-y-8">
        <p className="text-sm text-zinc-500">
          Comptes ayant accès au back-office. Pour l&apos;instant, chaque compte
          a tous les droits (gestion des rôles à venir).
        </p>

        {/* Ajouter un compte */}
        <form
          onSubmit={createUser}
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="font-semibold text-zinc-900">Ajouter un compte</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
            <input
              type="text"
              required
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {creating ? "Création…" : "Créer le compte"}
          </button>
          {error && <p className="text-sm text-red-600">⚠️ {error}</p>}
        </form>

        {/* Liste des comptes */}
        <div>
          <h2 className="mb-3 font-semibold text-zinc-900">
            Comptes existants{" "}
            {!loading && (
              <span className="text-sm font-normal text-zinc-400">
                ({users.length})
              </span>
            )}
          </h2>
          {loading ? (
            <p className="text-sm text-zinc-400">Chargement…</p>
          ) : (
            <ul className="space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {u.email}
                    </p>
                    <p className="text-xs text-zinc-400">
                      créé le{" "}
                      {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteUser(u.id, u.email)}
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
      </div>
    </AdminShell>
  );
}
