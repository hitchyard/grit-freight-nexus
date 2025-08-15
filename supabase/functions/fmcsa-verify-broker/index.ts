import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  applicationId: string;
  mcNumber?: string;
  dotNumber?: string;
}

interface FMCSAResponse {
  operatingStatus?: string;
  bondInsurance?: {
    bond?: boolean;
    insurance?: boolean;
  };
  legalName?: string;
  dbaName?: string;
  address?: string;
}

// FMCSA SAFER API implementation based on williamhaley/dot-safer-fmcsa-api
async function queryFMCSA(mcNumber?: string, dotNumber?: string): Promise<FMCSAResponse> {
  console.log(`Querying FMCSA for MC: ${mcNumber}, DOT: ${dotNumber}`);
  
  // Use DOT number if available, otherwise MC number
  const searchNumber = dotNumber || mcNumber;
  const searchType = dotNumber ? 'DOT' : 'MC';
  
  if (!searchNumber) {
    throw new Error('Either MC Number or DOT Number is required');
  }

  try {
    // FMCSA SAFER API endpoint
    const url = `https://safer.fmcsa.dot.gov/CompanySnapshot.aspx`;
    const params = new URLSearchParams({
      searchtype: searchType,
      query: searchNumber.replace(/[^0-9]/g, ''), // Remove non-numeric characters
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HitchyardBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`FMCSA API request failed: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse HTML response for key data
    const operatingStatus = extractOperatingStatus(html);
    const bondInsurance = extractBondInsurance(html);
    const legalName = extractLegalName(html);
    const dbaName = extractDBAName(html);
    const address = extractAddress(html);

    return {
      operatingStatus,
      bondInsurance,
      legalName,
      dbaName,
      address,
    };
  } catch (error) {
    console.error('FMCSA query error:', error);
    throw new Error(`Failed to verify with FMCSA: ${error.message}`);
  }
}

// HTML parsing functions
function extractOperatingStatus(html: string): string {
  const match = html.match(/Operating Status[:\s]*<[^>]*>([^<]+)/i);
  return match?.[1]?.trim() || 'Unknown';
}

function extractBondInsurance(html: string): { bond: boolean; insurance: boolean } {
  const bondMatch = html.match(/Carrier Operation[:\s]*[^<]*<[^>]*>([^<]*)/i);
  const insuranceMatch = html.match(/Insurance[:\s]*[^<]*<[^>]*>([^<]*)/i);
  
  return {
    bond: bondMatch?.[1]?.toLowerCase().includes('active') || false,
    insurance: insuranceMatch?.[1]?.toLowerCase().includes('active') || false,
  };
}

function extractLegalName(html: string): string {
  const match = html.match(/Legal Name[:\s]*<[^>]*>([^<]+)/i);
  return match?.[1]?.trim() || '';
}

function extractDBAName(html: string): string {
  const match = html.match(/DBA Name[:\s]*<[^>]*>([^<]+)/i);
  return match?.[1]?.trim() || '';
}

function extractAddress(html: string): string {
  const match = html.match(/Physical Address[:\s]*<[^>]*>([^<]+)/i);
  return match?.[1]?.trim() || '';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { applicationId, mcNumber, dotNumber }: VerificationRequest = await req.json();
    
    console.log(`Processing verification for application: ${applicationId}`);

    // Query FMCSA
    const fmcsaData = await queryFMCSA(mcNumber, dotNumber);
    
    // Determine approval status
    const isActive = fmcsaData.operatingStatus?.toLowerCase().includes('active');
    const isBondCompliant = fmcsaData.bondInsurance?.bond || false;
    const isInsuranceCompliant = fmcsaData.bondInsurance?.insurance || false;
    
    // Auto-approve if active and compliant
    const autoApproved = isActive && isBondCompliant && isInsuranceCompliant;
    const newStatus = autoApproved ? 'approved' : 'pending_review';

    // Update broker application with verification results
    const { error: updateError } = await supabaseClient
      .from('broker_applications')
      .update({
        fmcsa_verified: true,
        fmcsa_status: newStatus,
        fmcsa_operating_status: fmcsaData.operatingStatus,
        fmcsa_bond_compliant: isBondCompliant,
        fmcsa_insurance_compliant: isInsuranceCompliant,
        fmcsa_legal_name: fmcsaData.legalName,
        fmcsa_dba_name: fmcsaData.dbaName,
        fmcsa_address: fmcsaData.address,
        fmcsa_verification_timestamp: new Date().toISOString(),
        fmcsa_raw_response: fmcsaData,
        status: newStatus,
      })
      .eq('id', applicationId);

    if (updateError) {
      throw updateError;
    }

    // If auto-approved, also create broker profile
    if (autoApproved) {
      // Get application data
      const { data: application, error: fetchError } = await supabaseClient
        .from('broker_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Create broker profile
      const { error: brokerError } = await supabaseClient
        .from('brokers')
        .insert({
          user_id: application.user_id,
          company_name: application.company_name,
          mc_number: application.mc_number,
          dot_number: application.dot_number,
          address: application.address,
          city: application.city,
          state: application.state,
          zip_code: application.zip_code,
          status: 'approved',
        });

      if (brokerError) {
        console.error('Error creating broker profile:', brokerError);
        // Don't throw here, verification was successful
      }

      // Send approval notification
      try {
        await supabaseClient.functions.invoke('send-broker-notification', {
          body: {
            email: application.email,
            firstName: application.first_name,
            lastName: application.last_name,
            status: 'approved',
            mcNumber: application.mc_number,
          },
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't throw, verification was successful
      }
    } else {
      // Send pending review notification
      try {
        const { data: application } = await supabaseClient
          .from('broker_applications')
          .select('email, first_name, last_name, mc_number')
          .eq('id', applicationId)
          .single();

        if (application) {
          await supabaseClient.functions.invoke('send-broker-notification', {
            body: {
              email: application.email,
              firstName: application.first_name,
              lastName: application.last_name,
              status: 'pending_review',
              mcNumber: application.mc_number,
              reason: !isActive ? 'Inactive operating status' : 'Missing bond/insurance compliance',
            },
          });
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: newStatus,
        autoApproved,
        fmcsaData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});