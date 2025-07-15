import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchingRequest {
  trucker_id?: string;
  load_id?: string;
  threshold?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting vector matching...");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { trucker_id, load_id, threshold = 0.8 }: MatchingRequest = await req.json();

    // Get OpenAI API key
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OpenAI API key not configured");
    }

    let matches = [];

    if (trucker_id) {
      // Find matching loads for a trucker
      const { data: trucker, error: truckerError } = await supabase
        .from("truckers")
        .select("*, users(first_name, last_name)")
        .eq("id", trucker_id)
        .single();

      if (truckerError || !trucker) {
        throw new Error("Trucker not found");
      }

      // Get trucker's lane profile
      const profileText = [
        trucker.preferred_lanes?.join(", "),
        trucker.truck_type,
        trucker.home_base_city,
        trucker.home_base_state,
        `Max radius: ${trucker.max_radius} miles`,
        `Min rate: $${trucker.rate_per_mile_min}/mile`
      ].filter(Boolean).join(" | ");

      // Generate embedding for trucker profile if not exists
      if (!trucker.lane_profile_vector && profileText) {
        console.log("Generating embedding for trucker profile...");
        
        const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: profileText,
            dimensions: 1536,
          }),
        });

        if (!embeddingResponse.ok) {
          throw new Error("Failed to generate trucker embedding");
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Update trucker with embedding
        await supabase
          .from("truckers")
          .update({ lane_profile_vector: embedding })
          .eq("id", trucker_id);

        trucker.lane_profile_vector = embedding;
      }

      if (trucker.lane_profile_vector) {
        // Find similar loads using vector similarity
        const { data: similarLoads, error: matchError } = await supabase.rpc('find_matching_loads', {
          trucker_vector: trucker.lane_profile_vector,
          similarity_threshold: threshold,
          trucker_broker_id: trucker.broker_id
        });

        if (matchError) {
          console.error("Error finding matching loads:", matchError);
        } else {
          matches = similarLoads || [];
        }
      }

    } else if (load_id) {
      // Find matching truckers for a load
      const { data: load, error: loadError } = await supabase
        .from("loads")
        .select("*")
        .eq("id", load_id)
        .single();

      if (loadError || !load) {
        throw new Error("Load not found");
      }

      // Check if load vector exists
      const { data: loadVector } = await supabase
        .from("load_vectors")
        .select("embedding")
        .eq("load_id", load_id)
        .single();

      let embedding = loadVector?.embedding;

      if (!embedding) {
        // Generate embedding for load
        const loadText = [
          load.title,
          load.description,
          `${load.pickup_city}, ${load.pickup_state} to ${load.delivery_city}, ${load.delivery_state}`,
          load.truck_type,
          `$${load.rate} (${load.rate_per_mile}/mile)`,
          `${load.distance_miles} miles`,
          load.equipment_needed,
          load.special_requirements
        ].filter(Boolean).join(" | ");

        console.log("Generating embedding for load...");
        
        const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: loadText,
            dimensions: 1536,
          }),
        });

        if (!embeddingResponse.ok) {
          throw new Error("Failed to generate load embedding");
        }

        const embeddingData = await embeddingResponse.json();
        embedding = embeddingData.data[0].embedding;

        // Store the embedding
        await supabase
          .from("load_vectors")
          .insert({
            load_id,
            embedding,
            content_hash: btoa(loadText).slice(0, 50)
          });
      }

      // Find similar truckers
      const { data: similarTruckers, error: matchError } = await supabase.rpc('find_matching_truckers', {
        load_vector: embedding,
        similarity_threshold: threshold,
        load_broker_id: load.broker_id
      });

      if (matchError) {
        console.error("Error finding matching truckers:", matchError);
      } else {
        matches = similarTruckers || [];
      }
    }

    // Log the matching event
    await supabase.from("events").insert({
      event_type: "vector_matching",
      event_data: { 
        trucker_id, 
        load_id, 
        matches_found: matches.length,
        threshold 
      },
    });

    console.log(`Found ${matches.length} matches`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches,
        count: matches.length 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in vector-matching:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});