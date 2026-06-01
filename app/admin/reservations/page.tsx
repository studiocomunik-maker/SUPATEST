"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Check, RotateCcw, Phone, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AdminShell from "../AdminShell";
import { SkeletonList } from "../Skeleton";

type Reservation = {
  id: number;
  name: string;
  date: string | null;
  time: string | null;
  guests: number | null;
  phone: string | null;
  status: string;
  created_at: string;
};

export default function ReservationsAdminPage() {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reservations")
      .select("id, name, date, time, guests, phone, status, created_at")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleStatus(r: Reservation) {
    const supabase = createClient();
    const next = r.status === "traitée" ? "nouvelle" : "traitée";
    await supabase.from("reservations").update({ status: next }).eq("id", r.id);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Supprimer cette demande ?")) return;
    const supabase = createClient();
    await supabase.from("reservations").delete().eq("id", id);
    load();
  }

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("fr-FR") : "—";

  return (
    <AdminShell title="Réservations">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-sm text-zinc-500">
          Demandes reçues via le formulaire du site, la plus récente en premier.
        </p>

        {error && <p className="mb-4 text-sm text-red-600">⚠️ {error}</p>}

        {loading ? (
          <SkeletonList rows={4} />
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center text-sm text-zinc-500">
            Aucune demande pour l&apos;instant.
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className={`flex items-center gap-4 rounded-lg border bg-white px-4 py-3 ${
                  r.status === "traitée"
                    ? "border-zinc-200 opacity-60"
                    : "border-zinc-300"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900">{r.name}</span>
                    {r.status === "traitée" && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-green-700">
                        traitée
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                    <span>
                      {fmtDate(r.date)} {r.time && `à ${r.time}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {r.guests ?? "?"} couv.
                    </span>
                    {r.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {r.phone}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleStatus(r)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  title={r.status === "traitée" ? "Rouvrir" : "Marquer traitée"}
                >
                  {r.status === "traitée" ? (
                    <RotateCcw className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => remove(r.id)}
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
