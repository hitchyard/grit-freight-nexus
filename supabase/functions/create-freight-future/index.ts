import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-FREIGHT-FUTURE] ${step}${detailsStr}`);
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

    const body = await req.json();
    const { 
      lane_from, 
      lane_to, 
      truck_type, 
      rate_per_mile, 
      estimated_miles, 
      start_date, 
      end_date 
    } = body;

    if (!lane_from || !lane_to || !truck_type || !rate_per_mile || !estimated_miles || !start_date || !end_date) {
      throw new Error("Missing required fields");
    }

    const total_commitment = rate_per_mile * estimated_miles;
    
    // Calculate AI confidence score (simplified for MVP)
    const ai_confidence_score = Math.random() * 0.4 + 0.6; // Random between 0.6-1.0
    
    // Determine market demand (simplified)
    const demands = ['High', 'Medium', 'Low'];
    const market_demand = demands[Math.floor(Math.random() * demands.length)];

    // Create the freight future
    const { data: future, error: futureError } = await supabaseClient
      .from('futures')
      .insert({
        lane_from,
        lane_to,
        truck_type,
        rate_per_mile,
        estimated_miles,
        total_commitment,
        start_date,
        end_date,
        created_by: user.id,
        ai_confidence_score,
        market_demand,
        status: 'open'
      })
      .select()
      .single();

    if (futureError) {
      logStep("Database insert error", { error: futureError });
      throw new Error(`Database error: ${futureError.message}`);
    }

    logStep("Successfully created freight future", { 
      futureId: future.id,
      totalCommitment: total_commitment
    });

    return new Response(JSON.stringify({ 
      success: true,
      future: future,
      message: "Freight future created successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-freight-future", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});