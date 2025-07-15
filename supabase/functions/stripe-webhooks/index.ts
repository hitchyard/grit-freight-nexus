import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing Stripe webhook...");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      // Verify webhook signature if secret is configured
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response("Webhook signature verification failed", { status: 400 });
      }
    } else {
      // Parse without verification (for development)
      event = JSON.parse(body);
    }

    console.log("Processing event:", event.type);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment status
        await supabase
          .from("load_payments")
          .update({ 
            status: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        // Get the load details
        const { data: payment } = await supabase
          .from("load_payments")
          .select("load_id, broker_id, trucker_id")
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .single();

        if (payment?.load_id) {
          // Update load status if this was a successful payment
          await supabase
            .from("loads")
            .update({ 
              status: "posted", // Keep as posted until actually booked
              updated_at: new Date().toISOString()
            })
            .eq("id", payment.load_id);
        }

        console.log("Payment intent succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await supabase
          .from("load_payments")
          .update({ 
            status: "failed",
            updated_at: new Date().toISOString()
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        console.log("Payment intent failed:", paymentIntent.id);
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        
        // Update Stripe account status
        await supabase
          .from("stripe_accounts")
          .update({
            onboarding_complete: account.details_submitted && account.payouts_enabled,
            payouts_enabled: account.payouts_enabled,
            charges_enabled: account.charges_enabled,
            updated_at: new Date().toISOString()
          })
          .eq("stripe_account_id", account.id);

        // Update broker onboarding status
        await supabase
          .from("brokers")
          .update({
            stripe_onboarding_complete: account.details_submitted && account.payouts_enabled,
            updated_at: new Date().toISOString()
          })
          .eq("stripe_account_id", account.id);

        console.log("Account updated:", account.id);
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        
        // Log transfer for tracking
        await supabase.from("events").insert({
          event_type: "stripe_transfer_created",
          event_data: {
            transfer_id: transfer.id,
            amount: transfer.amount / 100,
            destination: transfer.destination,
            metadata: transfer.metadata
          },
        });

        console.log("Transfer created:", transfer.id);
        break;
      }

      case "payout.paid": {
        const payout = event.data.object as Stripe.Payout;
        
        // Update any related payment records
        await supabase.from("events").insert({
          event_type: "stripe_payout_paid",
          event_data: {
            payout_id: payout.id,
            amount: payout.amount / 100,
            account_id: event.account
          },
        });

        console.log("Payout paid:", payout.id);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Handle subscription payments if applicable
        await supabase.from("events").insert({
          event_type: "stripe_invoice_paid",
          event_data: {
            invoice_id: invoice.id,
            amount_paid: invoice.amount_paid / 100,
            customer: invoice.customer
          },
        });

        console.log("Invoice payment succeeded:", invoice.id);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    // Log all webhook events for debugging
    await supabase.from("events").insert({
      event_type: "stripe_webhook",
      event_data: {
        event_type: event.type,
        event_id: event.id,
        created: event.created,
        livemode: event.livemode
      },
    });

    return new Response(
      JSON.stringify({ success: true, event_type: event.type }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in stripe-webhooks:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});