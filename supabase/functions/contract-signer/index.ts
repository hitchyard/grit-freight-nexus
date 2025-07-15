import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocuSealWebhook {
  event_type: string;
  data: {
    id: string;
    status: string;
    template_id: string;
    submitters: Array<{
      id: string;
      email: string;
      name: string;
      status: string;
      completed_at?: string;
    }>;
    metadata?: {
      booking_id?: string;
      load_id?: string;
      broker_id?: string;
      document_type?: string;
    };
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing DocuSeal webhook...");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const webhook: DocuSealWebhook = await req.json();
    
    console.log("Webhook event:", webhook.event_type);
    console.log("Document status:", webhook.data.status);

    // Only process completed documents
    if (webhook.event_type !== "form.completed" || webhook.data.status !== "completed") {
      return new Response(JSON.stringify({ message: "Event ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { booking_id, load_id, broker_id, document_type } = webhook.data.metadata || {};

    if (booking_id) {
      // Update booking with signed document info
      const updateData: any = {};
      
      switch (document_type) {
        case "rate_confirmation":
          updateData.rate_confirmation_signed = true;
          break;
        case "bol":
          updateData.bol_uploaded = true;
          break;
        default:
          updateData.documents_signed = true;
      }

      updateData.updated_at = new Date().toISOString();

      const { error: bookingError } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", booking_id);

      if (bookingError) {
        console.error("Error updating booking:", bookingError);
        throw new Error("Failed to update booking");
      }

      console.log("Updated booking with signed document");

      // Check if all required documents are signed
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", booking_id)
        .single();

      if (!fetchError && booking) {
        const allDocsSigned = booking.documents_signed && 
                             booking.rate_confirmation_signed && 
                             booking.bol_uploaded;

        if (allDocsSigned && booking.status === "pending") {
          // Auto-confirm booking when all docs are signed
          await supabase
            .from("bookings")
            .update({ 
              status: "confirmed",
              updated_at: new Date().toISOString()
            })
            .eq("id", booking_id);

          // Update load status
          await supabase
            .from("loads")
            .update({ 
              status: "booked",
              updated_at: new Date().toISOString()
            })
            .eq("id", booking.load_id);

          console.log("Auto-confirmed booking after all documents signed");
        }
      }
    }

    // Log the contract signing event
    await supabase.from("events").insert({
      event_type: "contract_signed",
      event_data: {
        docuseal_id: webhook.data.id,
        booking_id,
        load_id,
        broker_id,
        document_type,
        submitters: webhook.data.submitters,
        completed_at: new Date().toISOString()
      },
    });

    // Send notification email if Postmark is configured
    const postmarkKey = Deno.env.get("POSTMARK_SERVER_API_KEY");
    if (postmarkKey && booking_id) {
      try {
        // Get booking details for notification
        const { data: bookingDetails } = await supabase
          .from("bookings")
          .select(`
            *,
            loads(title, pickup_city, pickup_state, delivery_city, delivery_state),
            truckers(users(email, first_name, last_name)),
            brokers(company_name, users(email, first_name, last_name))
          `)
          .eq("id", booking_id)
          .single();

        if (bookingDetails) {
          const emails = [
            bookingDetails.truckers.users.email,
            bookingDetails.brokers.users.email
          ];

          for (const email of emails) {
            await fetch("https://api.postmarkapp.com/email", {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Postmark-Server-Token": postmarkKey,
              },
              body: JSON.stringify({
                From: "noreply@hitchyard.com",
                To: email,
                Subject: `Document Signed - ${bookingDetails.loads.title}`,
                HtmlBody: `
                  <h2>Document Signed Successfully</h2>
                  <p>A document has been signed for load: <strong>${bookingDetails.loads.title}</strong></p>
                  <p><strong>Route:</strong> ${bookingDetails.loads.pickup_city}, ${bookingDetails.loads.pickup_state} → ${bookingDetails.loads.delivery_city}, ${bookingDetails.loads.delivery_state}</p>
                  <p><strong>Document Type:</strong> ${document_type || 'Contract'}</p>
                  <p>You can view the full details in your Hitchyard dashboard.</p>
                  <p><a href="https://hitchyard.com" style="background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a></p>
                `,
              }),
            });
          }
        }
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contract processed successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in contract-signer:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});