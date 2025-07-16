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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Verify user is a trucker
    const { data: trucker, error: truckerError } = await supabaseClient
      .from('truckers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (truckerError || !trucker) {
      throw new Error("Only truckers can accept precommitments");
    }
    logStep("Verified trucker", { truckerId: trucker.id });

    const body = await req.json();
    const { precommitment_id } = body;

    if (!precommitment_id) {
      throw new Error("Missing precommitment_id");
    }

    // Update precommitment to accepted status
    const { data, error } = await supabaseClient
      .from('precommitments')
      .update({
        status: 'accepted',
        accepted_by: user.id,
        accepted_at: new Date().toISOString()
      })
      .eq('id', precommitment_id)
      .eq('status', 'open') // Only accept if still open
      .select()
      .single();

    if (error) {
      logStep("Database update error", { error });
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error("Precommitment not found or already accepted");
    }

    logStep("Successfully accepted precommitment", { 
      precommitmentId: data.id, 
      acceptedBy: user.id 
    });

    // TODO: Trigger Stripe payment release logic here
    // This would involve updating the PaymentIntent to transfer funds
    
    return new Response(JSON.stringify({ 
      success: true,
      precommitment: data,
      message: "Precommitment accepted successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in accept-precommitment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});