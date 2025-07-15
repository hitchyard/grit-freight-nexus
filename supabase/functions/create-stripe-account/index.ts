import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StripeAccountRequest {
  email: string;
  company_name: string;
  country?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating Stripe Connect account...");
    
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

    // Get broker details
    const { data: broker, error: brokerError } = await supabase
      .from("brokers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (brokerError || !broker) {
      throw new Error("Broker profile not found");
    }

    // Check if Stripe account already exists
    if (broker.stripe_account_id) {
      return new Response(JSON.stringify({ 
        error: "Stripe account already exists",
        account_id: broker.stripe_account_id 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const { email, company_name, country = "US" }: StripeAccountRequest = await req.json();

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email,
      business_profile: {
        name: company_name,
        product_description: "Freight transportation services",
        support_email: email,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    console.log("Created Stripe account:", account.id);

    // Store Stripe account info in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService
      .from("stripe_accounts")
      .insert({
        broker_id: broker.id,
        stripe_account_id: account.id,
        onboarding_complete: false,
        payouts_enabled: account.payouts_enabled,
        charges_enabled: account.charges_enabled,
        account_type: account.type,
        country: account.country,
      });

    // Update broker with Stripe account ID
    await supabaseService
      .from("brokers")
      .update({ 
        stripe_account_id: account.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", broker.id);

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get("origin")}/broker?stripe_refresh=true`,
      return_url: `${req.headers.get("origin")}/broker?stripe_onboarding=complete`,
      type: "account_onboarding",
    });

    console.log("Created onboarding link");

    // Log the event
    await supabaseService.from("events").insert({
      user_id: user.id,
      event_type: "stripe_account_created",
      event_data: { 
        stripe_account_id: account.id,
        broker_id: broker.id,
        country
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        account_id: account.id,
        onboarding_url: accountLink.url,
        message: "Stripe account created successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in create-stripe-account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});