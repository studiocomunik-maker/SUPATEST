"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Image as ImageIcon,
  UtensilsCrossed,
  Images,
  CalendarDays,
  CalendarCheck,
  Users,
  LogOut,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Chaque section du site = une entrée de sidebar = une route /admin/...
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/admin", enabled: true },
  { label: "Hero", icon: ImageIcon, href: "/admin/hero", enabled: true },
  { label: "Menu", icon: UtensilsCrossed, href: "/admin/menu", enabled: true },
  { label: "Galerie", icon: Images, href: "/admin/gallery", enabled: true },
  { label: "Événements", icon: CalendarDays, href: "/admin/events", enabled: true },
  { label: "Réservations", icon: CalendarCheck, href: "/admin/reservations", enabled: true },
];

// Groupe « compte » (séparé visuellement)
const accountItems = [
  { label: "Espace compte", icon: Users, href: "/admin/account", enabled: true },
];

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/admin/login");
        return;
      }
      setEmail(data.user.email ?? null);
      setReady(true);
    });
  }, [router]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  function renderItem(item: (typeof navItems)[number]) {
    const active = pathname === item.href;
    const base =
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";

    if (!item.enabled) {
      return (
        <span key={item.label} className={`${base} cursor-not-allowed text-zinc-400`}>
          <item.icon className="h-4 w-4" />
          {item.label}
          <span className="ml-auto text-[10px] uppercase tracking-wide text-zinc-300">
            à venir
          </span>
        </span>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        className={`${base} ${
          active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
        }`}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  }

  if (!ready) {
    // Skeleton de la coquille pendant la vérification de session
    return (
      <div className="flex min-h-screen bg-zinc-100">
        <aside className="w-60 border-r border-zinc-200 bg-white p-3">
          <div className="mb-4 h-10 animate-pulse rounded bg-zinc-100" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-2 h-9 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </aside>
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="h-8 w-1/3 animate-pulse rounded bg-zinc-200" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-zinc-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <p className="font-semibold">Maison Margaux</p>
          <p className="text-xs text-zinc-400">Back-office</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(renderItem)}

          {/* Séparateur + groupe compte */}
          <div className="my-3 border-t border-zinc-200" />
          <p className="px-3 pb-1 text-[10px] uppercase tracking-wider text-zinc-400">
            Administration
          </p>
          {accountItems.map(renderItem)}
        </nav>
      </aside>

      {/* Zone principale */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
          <h1 className="text-sm font-medium text-zinc-700">{title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
