import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VehicleData {
  brand: string;
  model: string;
  year: string;
  variant?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  power?: string;
  co2?: string;
  region?: string;
  imageUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plate } = await req.json();

    if (!plate) {
      return new Response(
        JSON.stringify({ error: "License plate is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("KENNZEICHEN_API_KEY");
    if (!apiKey) {
      console.error("KENNZEICHEN_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Vehicle lookup service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean the plate: remove spaces and convert to uppercase
    const cleanPlate = plate.replace(/\s/g, "").toUpperCase();
    
    console.log(`Looking up vehicle for plate: ${cleanPlate}`);

    // Call KennzeichenAPI
    const apiUrl = `https://www.kennzeichenapi.ch/api/reg.asmx/CheckSwitzerland?RegistrationNumber=${encodeURIComponent(cleanPlate)}&username=${encodeURIComponent(apiKey)}`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`KennzeichenAPI error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: "Vehicle not found", found: false }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("KennzeichenAPI response:", JSON.stringify(data));

    // Check if vehicle was found
    if (!data || !data.CarMake || !data.CarMake.CurrentTextValue) {
      return new Response(
        JSON.stringify({ error: "Vehicle not found", found: false }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map the response to our format
    const vehicleData: VehicleData = {
      brand: data.CarMake?.CurrentTextValue || "",
      model: data.CarModel?.CurrentTextValue || "",
      year: data.RegistrationYear?.toString() || "",
      variant: data.Variant || undefined,
      fuelType: data.FuelType || undefined,
      transmission: data.Transmission || undefined,
      engineSize: data.EngineSize || undefined,
      power: data.Power || undefined,
      co2: data.Co2 || undefined,
      region: data.Region || undefined,
      imageUrl: data.ImageUrl || undefined,
    };

    return new Response(
      JSON.stringify({ 
        found: true, 
        vehicle: vehicleData,
        description: data.Description || `${vehicleData.brand} ${vehicleData.model}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error looking up vehicle:", error);
    return new Response(
      JSON.stringify({ error: "Failed to lookup vehicle", found: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
