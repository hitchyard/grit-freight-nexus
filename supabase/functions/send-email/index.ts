import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, text, html }: EmailRequest = await req.json();
    
    const API_KEY = Deno.env.get("POSTMARK_SERVER_API_KEY");
    const FROM_EMAIL = Deno.env.get("POSTMARK_FROM_EMAIL");

    if (!API_KEY || !FROM_EMAIL) {
      throw new Error("Missing Postmark configuration");
    }

    const emailBody: any = {
      From: FROM_EMAIL,
      To: to,
      Subject: subject,
    };

    if (html) {
      emailBody.HtmlBody = html;
    }
    if (text) {
      emailBody.TextBody = text;
    }

    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": API_KEY,
      },
      body: JSON.stringify(emailBody),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Postmark API error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});