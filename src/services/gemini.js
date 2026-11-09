import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiJSON, AI_ENABLED, VISION_MODEL } from "./ai";

// API Keys
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

// The shared prompt builder
const buildPrompt = (crop, locationData, weatherData) => `
You are an expert agronomist and farm planner.
Analyze this land for growing ${crop}.

Context:
- Location Coords: ${locationData}
- Current Weather: Temp ${weatherData?.currentTemp}°C, Precip ${weatherData?.precipitation}mm, Wind ${weatherData?.windSpeed}km/h.

Provide a structured JSON response with the following fields:
1. water_requirement_liters_per_season (number)
2. groundwater_stress_level (low/medium/high)
3. suitability_score (0-100)
4. predicted_yield_value_usd (number)
5. risk_analysis (short string describing specific risks like drought/frost)
6. irrigation_strategy (short string)
7. soil_amendment (short string)
8. equipment_needed (array of strings)
9. sustainability_score_details (short string explaining why it got a certain score)
10. estimated_land_area_acres (number, estimate the land area visible in the image in acres)
11. sustainability_score (number 0-100, consistent with sustainability_score_details)

Format the response as pure JSON without Markdown code blocks.
`;

// ---- GROQ (Primary) ----
const analyzeWithGroq = async (imageBase64, crop, locationData, weatherData) => {
    const prompt = buildPrompt(crop, locationData, weatherData);
    const base64Data = imageBase64.split(',')[1];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Data}`,
                            },
                        },
                    ],
                },
            ],
            temperature: 0.3,
            max_tokens: 1024,
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
};

// ---- ADAPTION (Primary) ----
// Uses the shared client in ./ai.js (key kept server-side by the Vite proxy).
const HAS_ADAPTION = AI_ENABLED;
const ADAPTION_MODEL = VISION_MODEL;

const analyzeWithAdaption = (imageBase64, crop, locationData, weatherData) =>
    aiJSON({ prompt: buildPrompt(crop, locationData, weatherData), image: imageBase64, temperature: 0.3 });

// ---- GEMINI (Fallback) ----
const analyzeWithGemini = async (imageBase64, crop, locationData, weatherData) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildPrompt(crop, locationData, weatherData);

    const imagePart = {
        inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: "image/jpeg",
        },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
};

// ---- MAIN EXPORT ----
export const analyzeFarm = async (imageFile, crop, locationData, weatherData) => {
    // 0. Try Adaption (Gemma 4 31B, key kept server-side via proxy)
    if (HAS_ADAPTION) {
        try {
            console.log(`🧠 Analyzing with Adaption (${ADAPTION_MODEL})...`);
            return await analyzeWithAdaption(imageFile, crop, locationData, weatherData);
        } catch (err) {
            console.warn("Adaption failed, trying Groq fallback:", err.message);
        }
    }

    // 1. Try Groq (fast, free tier)
    if (GROQ_KEY) {
        try {
            console.log("🧠 Analyzing with Groq (Llama 4 Scout Vision)...");
            return await analyzeWithGroq(imageFile, crop, locationData, weatherData);
        } catch (err) {
            console.warn("Groq failed, trying Gemini fallback:", err.message);
        }
    }

    // 2. Try Gemini
    if (genAI) {
        try {
            console.log("🧠 Analyzing with Gemini Flash...");
            return await analyzeWithGemini(imageFile, crop, locationData, weatherData);
        } catch (err) {
            console.warn("Gemini failed, using mock data:", err.message);
        }
    }

    // 3. Mock Data Fallback
    console.log("📊 Using mock analysis data");
    return {
        water_requirement_liters_per_season: 12500,
        groundwater_stress_level: "Medium",
        suitability_score: 88,
        predicted_yield_value_usd: 15400,
        risk_analysis: "Potential heat stress in mid-summer. Monitor soil moisture.",
        irrigation_strategy: "Drip irrigation with mulching to retain moisture.",
        soil_amendment: "Add organic compost to improve water retention.",
        equipment_needed: ["Drip Lines", "Soil Moisture Sensors", "Solar Pump"],
        sustainability_score_details: "High carbon sequestration potential with cover crops.",
        sustainability_score: 82,
        estimated_land_area_acres: 12.5
    };
};
