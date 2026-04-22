import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPERADMIN_EMAIL = "grupooptimizacion@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const password = Deno.env.get("SUPERADMIN_INITIAL_PASSWORD");

    if (!password) {
      return new Response(JSON.stringify({ error: "SUPERADMIN_INITIAL_PASSWORD not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Check if user exists
    const { data: list, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) throw listErr;

    let user = list.users.find((u) => u.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());

    if (!user) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: SUPERADMIN_EMAIL,
        password,
        email_confirm: true,
      });
      if (createErr) throw createErr;
      user = created.user!;
    } else {
      // Update password to match secret (idempotent)
      await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
    }

    // Assign superadmin role
    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert({ user_id: user!.id, role: "superadmin" }, { onConflict: "user_id,role" });
    if (roleErr) throw roleErr;

    return new Response(
      JSON.stringify({ ok: true, email: SUPERADMIN_EMAIL, user_id: user!.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
