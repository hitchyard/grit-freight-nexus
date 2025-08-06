import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACCEPT-PRECOMMITMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Invalid authentication token");
    }

    logStep("User authenticated", { userId: userData.user.id });

    const { precommitment_id } = await req.json();

    logStep("Request data received", { precommitment_id });

    if (!precommitment_id) {
      throw new Error("Missing precommitment_id");
    }

    // Get the precommitment
    const { data: precommitment, error: fetchError } = await supabaseClient
      .from("precommitments")
      .select("*")
      .eq("id", precommitment_id)
      .eq("status", "open")
      .single();

    if (fetchError || !precommitment) {
      throw new Error("Precommitment not found or already accepted");
    }

    logStep("Precommitment found", { precommitmentId: precommitment.id });

    // Update precommitment with trucker acceptance
    const { data: updatedPrecommitment, error: updateError } = await supabaseClient
      .from("precommitments")
      .update({
        accepted_by: userData.user.id,
        accepted_at: new Date().toISOString(),
        status: "accepted"
      })
      .eq("id", precommitment_id)
      .eq("status", "open") // Ensure it's still open
      .select()
      .single();

    if (updateError) {
      logStep("Update error", updateError);
      throw new Error("Failed to accept precommitment - it may have been accepted by another trucker");
    }

    logStep("Precommitment accepted successfully", { 
      acceptedBy: userData.user.id,
      precommitmentId: updatedPrecommitment.id 
    });

    return new Response(
      JSON.stringify({
        success: true,
        precommitment: updatedPrecommitment
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    logStep("ERROR", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});