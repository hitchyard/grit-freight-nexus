import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  first_name: string;
  last_name: string;
  truck_type: string;
  company_name?: string;
  phone?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting invite handler...");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get the inviting broker
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    // Verify the user is a broker
    const { data: broker, error: brokerError } = await supabase
      .from("brokers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (brokerError || !broker) {
      throw new Error("Only brokers can invite truckers");
    }

    const { email, first_name, last_name, truck_type, company_name, phone }: InviteRequest = await req.json();

    console.log("Processing invite for:", email);

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    
    if (existingUser.user) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the user account
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        role: "trucker",
      },
    });

    if (createError || !newUser.user) {
      throw new Error(`Failed to create user: ${createError?.message}`);
    }

    console.log("Created user:", newUser.user.id);

    // Create trucker profile
    const { error: truckerError } = await supabase
      .from("truckers")
      .insert({
        user_id: newUser.user.id,
        broker_id: broker.id,
        company_name,
        truck_type,
        invited_by: user.id,
        invited_at: new Date().toISOString(),
      });

    if (truckerError) {
      console.error("Error creating trucker profile:", truckerError);
      throw new Error("Failed to create trucker profile");
    }

    // Send invitation email using Postmark
    const postmarkKey = Deno.env.get("POSTMARK_SERVER_API_KEY");
    if (postmarkKey) {
      try {
        const emailResponse = await fetch("https://api.postmarkapp.com/email", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Postmark-Server-Token": postmarkKey,
          },
          body: JSON.stringify({
            From: "noreply@hitchyard.com",
            To: email,
            Subject: "Welcome to Hitchyard Load Board",
            HtmlBody: `
              <h1>Welcome to Hitchyard, ${first_name}!</h1>
              <p>You've been invited by ${broker.company_name} to join the Hitchyard Load Board.</p>
              <p>Hitchyard is an invite-only platform for trusted brokers and carriers to move quality freight.</p>
              <p><strong>Your Login Details:</strong></p>
              <ul>
                <li>Email: ${email}</li>
                <li>You can set your password by visiting our platform and using "Forgot Password"</li>
              </ul>
              <p><a href="https://hitchyard.com" style="background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Access Hitchyard</a></p>
              <p>Welcome to the grit club!</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Failed to send email:", await emailResponse.text());
        } else {
          console.log("Invitation email sent successfully");
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }
    }

    // Log the event
    await supabase.from("events").insert({
      user_id: user.id,
      event_type: "trucker_invited",
      event_data: { 
        invited_email: email, 
        invited_user_id: newUser.user.id,
        broker_id: broker.id 
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Trucker invited successfully",
        trucker_id: newUser.user.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in invite-handler:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});