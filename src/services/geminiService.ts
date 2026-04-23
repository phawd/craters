import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeArea(lat: number, lng: number, zoom: number) {
  const prompt = `You are a military historian and satellite imagery analyst specialized in the Fort McClellan, Alabama area (Pelham Range and Main Post).
  The user is focused on coordinates (${lat}, ${lng}) at zoom level ${zoom}.
  
  Analyze this area for:
  1. TEMPORAL COMPARISON: The user can now toggle between modern satellite and historical/legacy imagery. Analyze how vegetation reclamation (pine growth) and erosion have potentially obscured 1940s-era impacts.
  2. PHYSICAL SIGNATURES: Identify potential craters (circular depressions), disturbed soil, vegetation anomalies (clusters of trees where training was heavy), and historical building footprints (concrete pads, foundations).
  3. HISTORICAL CONTEXT: 
     - Fort McClellan was active from 1917 to 1999.
     - Mention specific units or schools (e.g., Chemical Corps, Military Police, WAC, Infantry).
     - Discuss ordnance likely used in this sector based on typical range layouts (e.g., small arms, mortars, 105mm artillery, or chemical training stimulants).
  4. CROSS-REFERENCE: Cross-reference identified physical signatures with known historical military activities at the base to assess the likelihood of these being related to ordnance testing, trench warfare training, or other subsurface disturbances.
  5. HAZARD ANALYSIS: Specifically mention UXO (Unexploded Ordnance) or potential chemical remnants (Mustard gas, White Phosphorus) associated with this base's history.
  
  Note: If the user is viewing "Historical Reference" or "USGS Ortho" modes, prioritize identifying structures that may have been demolished in the post-closure (BRAC) era.
  
  Format the response with elegant "Editorial" style headers and highly professional, informative paragraphs.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Analysis unavailable at this time.";
  }
}

export async function getQuickSearchPrompt(query: string) {
  const prompt = `The user is searching for "${query}" within the Fort McClellan military reservation. 
  Suggest 3 specific sets of coordinates (Latitude, Longitude) that represent important geographical features, historical building clusters, or known impact zones.
  
  User query: "${query}"
  
  Time periods to consider:
  - WWI/WWII Camp McClellan (Infantry Training)
  - Post-War Chemical Corps & MP School expansion
  - BRAC Closure era
  
  Format as a valid JSON array of objects: [{ "lat": number, "lng": number, "name": string, "reason": string, "type": "impact" | "structure", "confidence": number (0-1), "radius_meters": number }]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini search failed:", error);
    return [];
  }
}
