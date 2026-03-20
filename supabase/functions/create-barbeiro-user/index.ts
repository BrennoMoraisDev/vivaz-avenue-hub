import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

interface CreateBarbeiroRequest {
  nome: string;
  email: string;
  telefone: string;
  especialidade?: string;
  comissao?: number;
  senha?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: CreateBarbeiroRequest = await req.json();
    const { nome, email, telefone, especialidade, comissao = 50, senha } = payload;

    // Validate required fields
    if (!nome || !email || !telefone) {
      return new Response(
        JSON.stringify({ error: "Nome, email e telefone são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some((u) => u.email === email);

    if (userExists) {
      return new Response(
        JSON.stringify({ error: "Usuário com este email já existe" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate temporary password if not provided
    const temporarySenha = senha || Math.random().toString(36).slice(-12);

    // Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temporarySenha,
      email_confirm: true,
      user_metadata: { nome, telefone, especialidade },
    });

    if (authError || !authData.user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: authError?.message || "Erro ao criar usuário" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    // Create profile entry
    const { error: profileError } = await supabase.from("perfis").insert({
      id: userId,
      nome,
      telefone,
      role: "barbeiro",
    });

    if (profileError) {
      console.error("Profile error:", profileError);
      // Try to delete the user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: "Erro ao criar perfil do barbeiro" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create barbeiro entry
    const { error: barbeiroError } = await supabase.from("barbeiros").insert({
      nome,
      telefone,
      especialidade: especialidade || null,
      comissao,
      ativo: true,
      user_id: userId,
    });

    if (barbeiroError) {
      console.error("Barbeiro error:", barbeiroError);
      // Try to clean up if barbeiro creation fails
      await supabase.from("perfis").delete().eq("id", userId);
      await supabase.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: "Erro ao criar registro do barbeiro" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Barbeiro criado com sucesso",
        userId,
        email,
        temporarySenha: !senha ? temporarySenha : undefined,
        note: !senha
          ? "Uma senha temporária foi gerada. O barbeiro deve alterar a senha no primeiro login."
          : "O barbeiro pode fazer login com as credenciais fornecidas.",
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
