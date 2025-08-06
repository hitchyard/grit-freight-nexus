import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PRECOMMITMENT] ${step}${detailsStr}`);
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

    const { 
      lane_from, 
      lane_to, 
      truck_type, 
      forecast_rate, 
      miles_estimate, 
      expires_at 
    } = await req.json();

    logStep("Request data received", { 
      lane_from, 
      lane_to, 
      truck_type, 
      forecast_rate, 
      miles_estimate, 
      expires_at 
    });

    // Validate required fields
    if (!lane_from || !lane_to || !truck_type || !forecast_rate || !miles_estimate || !expires_at) {
      throw new Error("Missing required fields");
    }

    // Calculate commitment amount (10% of total estimated value)
    const totalEstimatedValue = forecast_rate * miles_estimate;
    const commitmentAmount = totalEstimatedValue * 0.10;

    logStep("Calculated commitment", { 
      totalEstimatedValue, 
      commitmentAmount 
    });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create payment intent for the commitment amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(commitmentAmount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: "precommitment",
        user_id: userData.user.id,
        lane_from,
        lane_to,
        truck_type,
      },
    });

    logStep("Stripe payment intent created", { 
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount 
    });

    // Insert precommitment into database
    const { data: precommitment, error: insertError } = await supabaseClient
      .from("precommitments")
      .insert({
        broker_id: userData.user.id,
        lane_from,
        lane_to,
        truck_type,
        forecast_rate,
        miles_estimate,
        commitment_amount: commitmentAmount,
        expires_at,
        status: 'open'
      })
      .select()
      .single();

    if (insertError) {
      logStep("Database insert error", insertError);
      throw insertError;
    }

    logStep("Precommitment created successfully", { 
      precommitmentId: precommitment.id 
    });

    return new Response(
      JSON.stringify({
        precommitment,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
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