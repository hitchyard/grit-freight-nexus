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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { future_id, broker_id, trucker_id } = await req.json();

    logStep("Request data received", { future_id, broker_id, trucker_id });

    if (!future_id || !broker_id || !trucker_id) {
      throw new Error("Missing required fields: future_id, broker_id, trucker_id");
    }

    // Get the freight future details
    const { data: future, error: futureError } = await supabaseClient
      .from("futures")
      .select("*")
      .eq("id", future_id)
      .single();

    if (futureError || !future) {
      throw new Error("Freight future not found");
    }

    logStep("Future details retrieved", { futureId: future.id, totalCommitment: future.total_commitment });

    // Calculate commission split using the database function
    const { data: commissionData, error: commissionError } = await supabaseClient
      .rpc("calculate_commission_split", { total_amount: future.total_commitment });

    if (commissionError || !commissionData || commissionData.length === 0) {
      throw new Error("Failed to calculate commission split");
    }

    const commission = commissionData[0];
    logStep("Commission calculated", commission);

    // Generate contract terms
    const contractTerms = {
      lane: {
        from: future.lane_from,
        to: future.lane_to
      },
      equipment: {
        type: future.truck_type
      },
      rates: {
        per_mile: future.rate_per_mile,
        estimated_miles: future.estimated_miles,
        total_amount: future.total_commitment
      },
      schedule: {
        start_date: future.start_date,
        end_date: future.end_date
      },
      payment_terms: {
        trucker_amount: commission.trucker_amount,
        broker_amount: commission.broker_amount,
        platform_amount: commission.platform_amount,
        payment_method: "stripe_connect",
        escrow_required: true
      },
      policies: {
        cancellation_policy: "24_hour_notice",
        modification_policy: "mutual_consent",
        dispute_resolution: "arbitration"
      }
    };

    logStep("Contract terms generated", contractTerms);

    // Create the contract
    const { data: contract, error: contractError } = await supabaseClient
      .from("contracts")
      .insert({
        future_id,
        broker_id,
        trucker_id,
        total_amount: future.total_commitment,
        trucker_amount: commission.trucker_amount,
        broker_amount: commission.broker_amount,
        platform_amount: commission.platform_amount,
        contract_terms: contractTerms,
        status: "pending",
        escrow_status: "pending"
      })
      .select()
      .single();

    if (contractError) {
      logStep("Contract creation error", contractError);
      throw contractError;
    }

    logStep("Contract created", { contractId: contract.id });

    // Update the future status to matched
    const { error: updateError } = await supabaseClient
      .from("futures")
      .update({
        status: "matched",
        matched_with: trucker_id
      })
      .eq("id", future_id);

    if (updateError) {
      logStep("Future update warning", updateError);
      // Don't fail the entire operation for this
    }

    logStep("Contract generation completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        contract
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