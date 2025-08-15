import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting periodic broker re-verification...');

    // Get all approved brokers that haven't been verified in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: applications, error: fetchError } = await supabaseClient
      .from('broker_applications')
      .select('id, mc_number, dot_number, company_name, email, first_name, last_name, fmcsa_verification_timestamp')
      .eq('status', 'approved')
      .eq('fmcsa_verified', true)
      .or(`fmcsa_verification_timestamp.is.null,fmcsa_verification_timestamp.lt.${thirtyDaysAgo.toISOString()}`);

    if (fetchError) {
      throw fetchError;
    }

    if (!applications || applications.length === 0) {
      console.log('No brokers need re-verification');
      return new Response(
        JSON.stringify({ success: true, message: 'No brokers need re-verification', count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Re-verifying ${applications.length} brokers...`);

    const results = [];
    
    for (const application of applications) {
      try {
        // Call FMCSA verification function
        const { data, error } = await supabaseClient.functions.invoke('fmcsa-verify-broker', {
          body: {
            applicationId: application.id,
            mcNumber: application.mc_number,
            dotNumber: application.dot_number,
          },
        });

        if (error) {
          console.error(`Re-verification failed for ${application.company_name}:`, error);
          results.push({
            applicationId: application.id,
            companyName: application.company_name,
            success: false,
            error: error.message,
          });
        } else {
          console.log(`Re-verification completed for ${application.company_name}`);
          results.push({
            applicationId: application.id,
            companyName: application.company_name,
            success: true,
            status: data.status,
            autoApproved: data.autoApproved,
          });

          // If status changed from approved to pending, notify admin
          if (data.status === 'pending_review') {
            try {
              await supabaseClient.functions.invoke('send-broker-notification', {
                body: {
                  email: application.email,
                  firstName: application.first_name,
                  lastName: application.last_name,
                  status: 'pending_review',
                  mcNumber: application.mc_number,
                  reason: 'Status changed during periodic re-verification',
                },
              });
            } catch (notificationError) {
              console.error('Error sending re-verification notification:', notificationError);
            }
          }
        }
      } catch (error) {
        console.error(`Error re-verifying ${application.company_name}:`, error);
        results.push({
          applicationId: application.id,
          companyName: application.company_name,
          success: false,
          error: error.message,
        });
      }

      // Add small delay to avoid overwhelming FMCSA API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Re-verification completed: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        totalProcessed: applications.length,
        successCount,
        failureCount,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Periodic re-verification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});