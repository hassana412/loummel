import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get admin secret from headers (simple protection)
    const adminSecret = req.headers.get("x-admin-secret");
    
    // Simple check - in production, use a more secure method
    if (adminSecret !== "loummel-admin-reset-2024") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results: { email: string; success: boolean; error?: string }[] = [];

    // Test accounts to reset
    const testAccounts = [
      { email: "admin@loummel.com", password: "Admin123!" },
      { email: "rhumsiki@loummel.com", password: "Shop123!" },
      { email: "partenaire@loummel.com", password: "Partner123!" },
      { email: "client@loummel.com", password: "Client123!" },
    ];

    for (const account of testAccounts) {
      try {
        // Find user by email
        const { data: userData, error: findError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (findError) {
          results.push({ email: account.email, success: false, error: findError.message });
          continue;
        }

        const user = userData.users.find(u => u.email === account.email);
        
        if (!user) {
          results.push({ email: account.email, success: false, error: "User not found" });
          continue;
        }

        // Update the user's password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { password: account.password }
        );

        if (updateError) {
          results.push({ email: account.email, success: false, error: updateError.message });
        } else {
          results.push({ email: account.email, success: true });
        }
      } catch (err) {
        results.push({ email: account.email, success: false, error: String(err) });
      }
    }

    console.log("[reset-test-passwords] Results:", results);

    return new Response(
      JSON.stringify({ 
        message: "Password reset complete",
        results 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("[reset-test-passwords] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
