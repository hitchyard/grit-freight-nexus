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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
      );
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    logStep("Processing webhook event", { type: event.type });

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const contractId = paymentIntent.metadata?.contract_id;

        if (contractId) {
          // Update contract status and escrow status
          await supabaseClient
            .from('contracts')
            .update({
              escrow_status: 'held',
              stripe_payment_intent_id: paymentIntent.id
            })
            .eq('id', contractId);

          logStep("Payment succeeded, escrow held", { contractId, paymentIntentId: paymentIntent.id });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const contractId = paymentIntent.metadata?.contract_id;

        if (contractId) {
          await supabaseClient
            .from('contracts')
            .update({
              status: 'cancelled',
              escrow_status: 'pending'
            })
            .eq('id', contractId);

          logStep("Payment failed, contract cancelled", { contractId });
        }
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object;
        const contractId = transfer.metadata?.contract_id;
        const recipientId = transfer.metadata?.recipient_id;

        if (contractId && recipientId) {
          // Record the payout
          await supabaseClient
            .from('payouts')
            .insert({
              contract_id: contractId,
              recipient_id: recipientId,
              amount: transfer.amount / 100, // Convert from cents
              stripe_transfer_id: transfer.id,
              status: 'processing'
            });

          logStep("Transfer created, payout recorded", { 
            contractId, 
            recipientId, 
            transferId: transfer.id 
          });
        }
        break;
      }

      case "transfer.paid": {
        const transfer = event.data.object;
        
        // Update payout status
        await supabaseClient
          .from('payouts')
          .update({ 
            status: 'completed',
            payout_date: new Date().toISOString()
          })
          .eq('stripe_transfer_id', transfer.id);

        logStep("Transfer completed", { transferId: transfer.id });
        break;
      }

      default:
        logStep("Unhandled webhook event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});