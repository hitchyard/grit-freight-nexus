import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-CONTRACT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { future_id, broker_id, trucker_id } = body;

    if (!future_id || !broker_id || !trucker_id) {
      throw new Error("Missing required fields: future_id, broker_id, trucker_id");
    }

    // Get the freight future details
    const { data: future, error: futureError } = await supabaseClient
      .from('futures')
      .select('*')
      .eq('id', future_id)
      .single();

    if (futureError || !future) {
      throw new Error("Freight future not found");
    }

    // Calculate commission splits using the database function
    const { data: commissionData, error: commissionError } = await supabaseClient
      .rpc('calculate_commission_split', { total_amount: future.total_commitment });

    if (commissionError) {
      throw new Error(`Commission calculation error: ${commissionError.message}`);
    }

    const splits = commissionData[0];

    // Generate contract terms
    const contract_terms = {
      lane_from: future.lane_from,
      lane_to: future.lane_to,
      truck_type: future.truck_type,
      rate_per_mile: future.rate_per_mile,
      estimated_miles: future.estimated_miles,
      start_date: future.start_date,
      end_date: future.end_date,
      payment_terms: "Payment upon delivery confirmation",
      cancellation_policy: "48 hours advance notice required",
      insurance_requirements: "Minimum $1M liability coverage required",
      commission_structure: {
        trucker_percentage: 80,
        broker_percentage: 10,
        platform_percentage: 10
      }
    };

    // Create the contract
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .insert({
        future_id,
        broker_id,
        trucker_id,
        total_amount: future.total_commitment,
        trucker_amount: splits.trucker_amount,
        broker_amount: splits.broker_amount,
        platform_amount: splits.platform_amount,
        contract_terms,
        status: 'pending'
      })
      .select()
      .single();

    if (contractError) {
      logStep("Contract creation error", { error: contractError });
      throw new Error(`Contract creation error: ${contractError.message}`);
    }

    // Update the future status to matched
    await supabaseClient
      .from('futures')
      .update({ 
        status: 'matched',
        matched_with: trucker_id
      })
      .eq('id', future_id);

    logStep("Successfully generated contract", { 
      contractId: contract.id,
      futureId: future_id
    });

    return new Response(JSON.stringify({ 
      success: true,
      contract: contract,
      message: "Contract generated successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-contract", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});