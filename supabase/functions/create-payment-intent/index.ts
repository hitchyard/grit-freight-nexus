import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentIntentRequest {
  load_id: string;
  amount: number; // in cents
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating payment intent...");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const { load_id, amount }: PaymentIntentRequest = await req.json();

    // Get load and broker details
    const { data: load, error: loadError } = await supabase
      .from("loads")
      .select(`
        *,
        brokers!inner(
          *,
          users!inner(email, first_name, last_name),
          stripe_accounts!inner(stripe_account_id, onboarding_complete)
        )
      `)
      .eq("id", load_id)
      .single();

    if (loadError || !load) {
      throw new Error("Load not found");
    }

    // Verify the user is the broker for this load
    if (load.brokers.user_id !== user.id) {
      throw new Error("Unauthorized: You can only create payments for your own loads");
    }

    // Check if broker has completed Stripe onboarding
    if (!load.brokers.stripe_accounts?.onboarding_complete) {
      throw new Error("Please complete Stripe onboarding first");
    }

    const stripeAccountId = load.brokers.stripe_accounts.stripe_account_id;

    // Calculate split amounts (80% trucker, 10% broker fee, 10% platform fee)
    const truckerAmount = Math.floor(amount * 0.8);
    const brokerFee = Math.floor(amount * 0.1);
    const platformFee = amount - truckerAmount - brokerFee;

    // Create payment intent with automatic payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      application_fee_amount: platformFee + brokerFee,
      on_behalf_of: stripeAccountId,
      transfer_data: {
        destination: stripeAccountId,
      },
      metadata: {
        load_id,
        broker_id: load.broker_id,
        trucker_amount: truckerAmount.toString(),
        broker_fee: brokerFee.toString(),
        platform_fee: platformFee.toString(),
      },
      description: `Payment for load: ${load.title}`,
    });

    console.log("Created payment intent:", paymentIntent.id);

    // Store payment record in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService
      .from("load_payments")
      .insert({
        load_id,
        broker_id: load.broker_id,
        stripe_payment_intent_id: paymentIntent.id,
        total_amount: amount / 100, // Convert to dollars
        trucker_amount: truckerAmount / 100,
        broker_fee: brokerFee / 100,
        platform_fee: platformFee / 100,
        status: "pending",
      });

    // Update load with payment info
    await supabaseService
      .from("loads")
      .update({ 
        status: "posted", // Keep as posted until booked
        updated_at: new Date().toISOString()
      })
      .eq("id", load_id);

    // Log the event
    await supabaseService.from("events").insert({
      user_id: user.id,
      event_type: "payment_intent_created",
      event_data: { 
        load_id,
        payment_intent_id: paymentIntent.id,
        amount: amount / 100,
        broker_id: load.broker_id
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount,
        splits: {
          trucker_amount: truckerAmount / 100,
          broker_fee: brokerFee / 100,
          platform_fee: platformFee / 100
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in create-payment-intent:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});