import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      throw new Error("No Stripe signature found");
    }

    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret!);
      logStep("Webhook signature verified", { type: event.type });
    } catch (err: any) {
      logStep("Webhook signature verification failed", err.message);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent succeeded", { 
          id: paymentIntent.id, 
          amount: paymentIntent.amount 
        });

        // Update contract escrow status if this is a contract payment
        if (paymentIntent.metadata?.type === "contract") {
          const { error: updateError } = await supabaseClient
            .from("contracts")
            .update({
              escrow_status: "held",
              stripe_payment_intent_id: paymentIntent.id
            })
            .eq("id", paymentIntent.metadata.contract_id);

          if (updateError) {
            logStep("Failed to update contract escrow status", updateError);
          } else {
            logStep("Contract escrow status updated to held");
          }
        }

        // Update precommitment status if this is a precommitment payment
        if (paymentIntent.metadata?.type === "precommitment") {
          const { error: updateError } = await supabaseClient
            .from("precommitments")
            .update({
              status: "funded"
            })
            .eq("broker_id", paymentIntent.metadata.user_id)
            .eq("status", "open");

          if (updateError) {
            logStep("Failed to update precommitment status", updateError);
          } else {
            logStep("Precommitment status updated to funded");
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent failed", { 
          id: paymentIntent.id, 
          lastPaymentError: paymentIntent.last_payment_error 
        });

        // Update contract status if payment failed
        if (paymentIntent.metadata?.type === "contract") {
          const { error: updateError } = await supabaseClient
            .from("contracts")
            .update({
              status: "cancelled",
              escrow_status: "failed"
            })
            .eq("id", paymentIntent.metadata.contract_id);

          if (updateError) {
            logStep("Failed to update contract after payment failure", updateError);
          } else {
            logStep("Contract cancelled due to payment failure");
          }
        }
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        logStep("Transfer created", { 
          id: transfer.id, 
          amount: transfer.amount,
          destination: transfer.destination 
        });

        // Record the payout
        const { error: insertError } = await supabaseClient
          .from("payouts")
          .insert({
            recipient_id: transfer.metadata?.recipient_id,
            contract_id: transfer.metadata?.contract_id,
            amount: transfer.amount / 100, // Convert from cents
            stripe_transfer_id: transfer.id,
            status: "created"
          });

        if (insertError) {
          logStep("Failed to record payout", insertError);
        } else {
          logStep("Payout recorded successfully");
        }
        break;
      }

      case "transfer.paid": {
        const transfer = event.data.object as Stripe.Transfer;
        logStep("Transfer paid", { 
          id: transfer.id, 
          amount: transfer.amount 
        });

        // Update payout status
        const { error: updateError } = await supabaseClient
          .from("payouts")
          .update({
            status: "completed",
            payout_date: new Date().toISOString()
          })
          .eq("stripe_transfer_id", transfer.id);

        if (updateError) {
          logStep("Failed to update payout status", updateError);
        } else {
          logStep("Payout status updated to completed");
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(
      JSON.stringify({ received: true }),
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