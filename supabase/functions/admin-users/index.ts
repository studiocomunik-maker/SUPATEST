// Edge Function "admin-users" — gestion des comptes du back-office.
// Détient la clé service_role (injectée par Supabase) → JAMAIS exposée au navigateur.
// Vérifie que l'appelant est authentifié, puis crée / liste / supprime des users.
// (Pour l'instant : tout utilisateur connecté a tous les droits — rôles à venir.)
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // Préflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Vérifie que l'appelant est bien authentifié (son token JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Non authentifié" }, 401);

    const caller = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authErr,
    } = await caller.auth.getUser();
    if (authErr || !user) return json({ error: "Session invalide" }, 401);

    // 2. Client admin (service_role) pour les opérations privilégiées
    const admin = createClient(url, serviceKey);
    const { action, email, password, userId } = await req
      .json()
      .catch(() => ({}));

    if (action === "list") {
      const { data, error } = await admin.auth.admin.listUsers();
      if (error) return json({ error: error.message }, 400);
      return json({
        users: data.users.map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
        })),
      });
    }

    if (action === "create") {
      if (!email || !password)
        return json({ error: "Email et mot de passe requis" }, 400);
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // compte utilisable immédiatement
      });
      if (error) return json({ error: error.message }, 400);
      return json({ user: { id: data.user.id, email: data.user.email } });
    }

    if (action === "delete") {
      if (!userId) return json({ error: "userId requis" }, 400);
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
