# Maison Margaux — site + back-office (Next.js × Supabase)

Site vitrine restaurant avec un **back-office** (CMS sur mesure) dont le contenu
est piloté en direct depuis Supabase. Déployé sur **Vercel**.

> ⚙️ **Architecture 100 % client-side** : toutes les requêtes Supabase partent du
> navigateur (`@supabase/ssr` → `createBrowserClient`). Il n'y a **pas** de
> Server Components Supabase, **pas** de `server.ts`, **pas** de middleware/proxy.
> (Ces fichiers ont existé au début puis ont été retirés — si tu vois une vieille
> doc qui les mentionne, c'est obsolète.)

## Architecture réelle

| Fichier | Rôle |
| --- | --- |
| `utils/supabase/client.ts` | Client Supabase navigateur (la seule façon d'accéder à la base) |
| `utils/content.ts` | Helper `getContent(keys)` pour lire la table clé/valeur `site_content` |
| `app/page.tsx` | Page d'accueil = landing restaurant (assemble les sections) |
| `app/restaurant/components/*` | Sections du site (Hero, Features, Menu, Gallery, Events, Reservation…) — lisent Supabase en live, fallback sur `data.ts` |
| `app/admin/*` | Back-office (auth + CRUD : hero, menu, gallery, events, reservations, comptes) |
| `supabase/functions/admin-users/` | **Edge Function** pour gérer les comptes (détient la clé `service_role`) |

## Mise en route (nouveau projet / clone frais)

### 1. Variables d'environnement
`.env.local` (local) **et** Vercel → Settings → Environment Variables :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```
(Nouvelles clés Supabase : `sb_publishable_…`, publique par design — protégée par la RLS.)

### 2. Base de données (SQL Editor de Supabase)
```sql
-- Contenu clé/valeur (textes/images éditables : hero.accroche, menu.mentions…)
create table if not exists site_content (
  key text primary key, value text, updated_at timestamptz not null default now()
);
-- Carte
create table if not exists menu_items (
  id bigint generated always as identity primary key,
  section text not null, name text not null, description text, price text, tag text,
  created_at timestamptz not null default now()
);
-- Galerie (width/height pour next/image + masonry sans CLS)
create table if not exists gallery (
  id bigint generated always as identity primary key,
  image_url text not null, caption text, width int, height int,
  position int not null default 0, created_at timestamptz not null default now()
);
-- Événements
create table if not exists events (
  id bigint generated always as identity primary key,
  title text not null, description text, event_date date, image_url text,
  position int not null default 0, created_at timestamptz not null default now()
);
-- Réservations
create table if not exists reservations (
  id bigint generated always as identity primary key,
  name text not null, date date, time text, guests int, phone text,
  status text not null default 'nouvelle', created_at timestamptz not null default now()
);

-- RLS : lecture publique partout, écriture réservée aux connectés.
-- Exception : reservations.insert ouvert (formulaire public).
alter table site_content enable row level security;
alter table menu_items  enable row level security;
alter table gallery     enable row level security;
alter table events      enable row level security;
alter table reservations enable row level security;

create policy "read" on site_content for select to anon, authenticated using (true);
create policy "write" on site_content for all to authenticated using (true) with check (true);
create policy "read" on menu_items for select to anon, authenticated using (true);
create policy "write" on menu_items for all to authenticated using (true) with check (true);
create policy "read" on gallery for select to anon, authenticated using (true);
create policy "write" on gallery for all to authenticated using (true) with check (true);
create policy "read" on events for select to anon, authenticated using (true);
create policy "write" on events for all to authenticated using (true) with check (true);
create policy "read" on reservations for select to authenticated using (true);
create policy "insert" on reservations for insert to anon, authenticated with check (true);
create policy "manage" on reservations for update to authenticated using (true) with check (true);
create policy "delete" on reservations for delete to authenticated using (true);

-- Bucket d'images public
insert into storage.buckets (id, name, public) values ('media','media',true)
on conflict (id) do nothing;
create policy "media read" on storage.objects for select to anon, authenticated using (bucket_id='media');
create policy "media write" on storage.objects for insert to authenticated with check (bucket_id='media');
create policy "media update" on storage.objects for update to authenticated using (bucket_id='media') with check (bucket_id='media');
```

### 3. ⚠️ Déployer l'Edge Function (NON automatique)
La gestion des comptes (`/admin/account`) appelle l'Edge Function `admin-users`.
**Elle n'est PAS déployée par git/Vercel** — il faut la déployer sur le projet
Supabase, sinon l'écran "Espace compte" affichera une erreur (le reste du site
fonctionne quand même) :
```bash
# via la CLI Supabase (lié au projet : npx supabase link --project-ref <ref>)
npx supabase functions deploy admin-users
```
Ou dans le **Dashboard Supabase → Edge Functions → Deploy a function → Via Editor**,
nom exact `admin-users`, coller le contenu de `supabase/functions/admin-users/index.ts`.
Les secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) sont
injectés automatiquement par Supabase.

### 4. Créer un compte admin
Supabase → **Authentication → Users → Add user** (coche **Auto Confirm User**).

### 5. Lancer
```bash
npm install
npm run dev      # http://localhost:3000  (ou le port indiqué)
```
Back-office : `/admin/login`.

## Déploiement
Push sur `main` → **Vercel redéploie automatiquement**. Le contenu (menu, photos,
événements…) édité dans le back-office est **live**, sans rebuild.
