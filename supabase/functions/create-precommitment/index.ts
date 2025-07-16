import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const { lane_from, lane_to, truck_type, forecast_rate, miles_estimate, expires_at } = body;

    if (!lane_from || !lane_to || !truck_type || !forecast_rate || !miles_estimate || !expires_at) {
      throw new Error("Missing required fields");
    }

    const commitment_amount = forecast_rate * miles_estimate;
    logStep("Calculated commitment amount", { commitment_amount, forecast_rate, miles_estimate });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(commitment_amount * 100), // in cents
      currency: 'usd',
      metadata: { 
        type: 'precommitment', 
        broker_id: user.id,
        lane_from,
        lane_to,
        truck_type
      },
    });
    logStep("Created Stripe PaymentIntent", { paymentIntentId: paymentIntent.id });

    // Insert precommitment into database
    const { data, error } = await supabaseClient.from('precommitments').insert({
      broker_id: user.id,
      lane_from,
      lane_to,
      truck_type,
      forecast_rate,
      miles_estimate,
      commitment_amount,
      expires_at
    }).select().single();

    if (error) {
      logStep("Database insert error", { error });
      throw new Error(`Database error: ${error.message}`);
    }

    logStep("Successfully created precommitment", { precommitmentId: data.id });

    return new Response(JSON.stringify({ 
      payment_intent: paymentIntent.client_secret, 
      precommitment: data 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-precommitment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});