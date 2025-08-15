import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  firstName: string;
  lastName: string;
  status: 'approved' | 'pending_review' | 'rejected';
  mcNumber?: string;
  reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, status, mcNumber, reason }: NotificationRequest = await req.json();
    
    const POSTMARK_API_KEY = Deno.env.get("POSTMARK_API_KEY");
    const FROM_EMAIL = Deno.env.get("POSTMARK_FROM_EMAIL");

    if (!POSTMARK_API_KEY || !FROM_EMAIL) {
      throw new Error("Missing Postmark configuration");
    }

    let subject: string;
    let htmlBody: string;
    
    if (status === 'approved') {
      subject = "Welcome to Hitchyard - Your Broker Application is Approved!";
      htmlBody = `
        <h1>Congratulations, ${firstName}!</h1>
        <p>Your broker application has been approved and verified through the FMCSA SAFER database.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Verification Details:</h3>
          <ul>
            <li><strong>Company:</strong> Verified active status</li>
            <li><strong>MC Number:</strong> ${mcNumber}</li>
            <li><strong>Bond/Insurance:</strong> Compliant</li>
          </ul>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Log in to your Hitchyard dashboard</li>
          <li>Complete your Stripe Connect setup for payments</li>
          <li>Start posting loads and connecting with truckers</li>
        </ol>
        
        <p>
          <a href="https://hitchyard.com/login" style="background-color: #2E4057; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Dashboard
          </a>
        </p>
        
        <p>Welcome to the Hitchyard network!</p>
        <p>Best regards,<br>The Hitchyard Team</p>
      `;
    } else if (status === 'pending_review') {
      subject = "Hitchyard Broker Application - Additional Review Required";
      htmlBody = `
        <h1>Thank you for your application, ${firstName}</h1>
        <p>Your broker application has been submitted and requires additional review.</p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3>Review Required:</h3>
          <p><strong>Reason:</strong> ${reason || 'Additional documentation needed'}</p>
          <p><strong>MC Number:</strong> ${mcNumber}</p>
        </div>
        
        <h3>What happens next:</h3>
        <ul>
          <li>Our team will review your application within 24-48 hours</li>
          <li>We may request additional documentation</li>
          <li>You'll receive an email once your application is processed</li>
        </ul>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Hitchyard Team</p>
      `;
    } else {
      subject = "Hitchyard Broker Application Update";
      htmlBody = `
        <h1>Application Update, ${firstName}</h1>
        <p>Your broker application status has been updated.</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3>Status: ${status}</h3>
          <p><strong>Reason:</strong> ${reason || 'Please contact support for details'}</p>
        </div>
        
        <p>If you believe this is an error or need assistance, please contact our support team.</p>
        <p>Best regards,<br>The Hitchyard Team</p>
      `;
    }

    // Send email via Postmark
    const emailResponse = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_API_KEY,
      },
      body: JSON.stringify({
        From: FROM_EMAIL,
        To: email,
        Subject: subject,
        HtmlBody: htmlBody,
        MessageStream: "outbound",
      }),
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      throw new Error(`Postmark API error: ${JSON.stringify(emailData)}`);
    }

    console.log(`Notification sent to ${email} with status ${status}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailData.MessageID,
        status: status 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});