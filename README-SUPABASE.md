# Démo Supabase × Next.js 16

Petit terrain de jeu pour comprendre Supabase avec le workflow recommandé
(Next.js App Router + `@supabase/ssr`).

## Architecture

| Fichier | Rôle |
| --- | --- |
| `utils/supabase/client.ts` | Client navigateur (Client Components) |
| `utils/supabase/server.ts` | Client serveur (Server Components / actions) |
| `utils/supabase/proxy.ts` + `proxy.ts` | Rafraîchit la session via cookies (ex-"middleware", renommé en Next 16) |
| `app/page.tsx` | **Lecture** des notes côté serveur |
| `app/notes-form.tsx` | **Écriture** d'une note côté navigateur |

## 1. Brancher tes clés

Dans `.env.local` (déjà créé), remplace par tes valeurs réelles
(Supabase → **Project Settings → API**) :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 2. Créer la table (SQL Editor de Supabase)

Colle ce script dans **SQL Editor → New query**, puis Run :

```sql
-- Table de démo
create table if not exists notes (
  id bigint generated always as identity primary key,
  title text not null,
  created_at timestamptz not null default now()
);

-- Active la sécurité au niveau ligne (RLS) : OBLIGATOIRE.
-- Sans policy, personne ne peut lire/écrire — c'est le comportement sûr par défaut.
alter table notes enable row level security;

-- Pour la démo : on autorise tout le monde (clé anon) à lire et insérer.
-- ⚠️ À ne PAS faire en prod tel quel — on filtrerait par utilisateur authentifié.
create policy "Lecture publique des notes"
  on notes for select
  to anon, authenticated
  using (true);

create policy "Insertion publique des notes"
  on notes for insert
  to anon, authenticated
  with check (true);

-- Quelques lignes d'exemple
insert into notes (title) values
  ('Première note depuis le SQL Editor'),
  ('Supabase, c''est juste du Postgres + une API');
```

## 3. Lancer

```bash
npm run dev
```

Ouvre http://localhost:3000 — tu devrais voir les notes d'exemple et pouvoir
en ajouter (l'insert part du navigateur, puis `router.refresh()` re-rend le
Server Component avec la liste à jour).

## Concepts clés à retenir

- **RLS (Row Level Security)** : la vraie sécurité est en base, pas dans le code. La clé `anon` est publique.
- **Server vs Client** : on lit côté serveur (rapide, SEO), on mute côté client ou via Server Actions.
- **`@supabase/ssr`** : gère la session utilisateur dans les cookies pour que serveur et client partagent le même état d'auth.
