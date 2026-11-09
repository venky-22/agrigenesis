// Crop Care AI service, using the shared Adaption client in src/services/ai.js.
import { Message, CropRisk } from "../types";
import { aiText, aiJSON } from "../../../services/ai";

export const analyzeCropRisk = async (crop: string, location: string): Promise<{ risks: CropRisk[], explanation: string }> => {
  return aiJSON({
    system: 'You are an agricultural climate risk analyst.',
    temperature: 0.4,
    prompt: `Analyze climate risks for ${crop} in ${location}. Return a JSON object with this exact structure:
{
  "risks": [
    {"label": "Heat", "score": <0-100>, "color": "#ff6b35", "description": "description here"},
    {"label": "Drought", "score": <0-100>, "color": "#f7931e", "description": "description here"},
    {"label": "Flood", "score": <0-100>, "color": "#4a90e2", "description": "description here"},
    {"label": "Frost", "score": <0-100>, "color": "#7dd3fc", "description": "description here"}
  ],
  "explanation": "brief explanation here"
}`,
  });
};

export const getPlantHealthDiagnosis = async (imageData: string, mimeType: string): Promise<string> => {
  const text = await aiText({
    system: 'You are a plant pathologist helping a small-scale farmer. Use plain language.',
    image: `data:${mimeType};base64,${imageData}`,
    prompt: "Diagnose this plant's health. Identify the plant if you can, then any diseases, pests, or nutrient deficiencies visible. Say how confident you are, and suggest organic and chemical treatments if applicable. If the photo is unclear, say what photo would help.",
    temperature: 0.4,
  });
  return text || "Unable to diagnose plant health.";
};

export const generateFarmVisualization = async (_prompt: string): Promise<string | undefined> => {
  return undefined; // image generation not supported by the text models
};

export const getWeatherForecast = async (crop: string, location: string) => {
  const text = await aiText({
    system: 'You are a helpful agricultural weather assistant. You do not have live data, so frame this as typical conditions and seasonal guidance, and point the farmer to the live 7-day forecast on the page for actual numbers.',
    prompt: `Give agricultural weather guidance for ${location} for this week, focused on ${crop} farming (temperature, humidity, precipitation, wind, frost risk). Include any relevant farming advice for this time of year. Use metric units.`,
  });
  return { text, sources: [] as any[] };
};

export const getChatResponse = async (history: Message[], userInput: string, context?: any) => {
  const text = await aiText({
    system: `You are the AgriGenesis farm assistant, an expert agricultural consultant. Help farmers with crop management, weather risks, and sustainable practices. Farm context: ${JSON.stringify(context)}. Be concise, practical, and supportive. Use metric units.`,
    history: history.map(msg => ({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.content })),
    prompt: userInput,
    temperature: 0.6,
  });
  return { text, sources: [] as any[] };
};

export interface YieldPrediction {
  expectedYield: {
    low: number;
    medium: number;
    high: number;
    unit: string;
  };
  confidence: number;
  harvestDate: string;
  revenueProjection: {
    low: number;
    medium: number;
    high: number;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
  regionalAverage: number;
  recommendations: string[];
  lastUpdated: string;
}

export const predictYield = async (
  crop: string,
  location: string,
  fieldSize: string,
  risks: CropRisk[]
): Promise<YieldPrediction> => {
  const currentDate = new Date().toISOString().split('T')[0];
  try {
    const risksContext = risks.map(r => `${r.label}: ${r.score}% (${r.description})`).join(', ');
    return await aiJSON({
      system: 'You are an agricultural data scientist.',
      temperature: 0.4,
      prompt: `Predict crop yield for ${crop} in ${location} (field size: ${fieldSize}).

Current date: ${currentDate}
Current risk factors: ${risksContext}

Rules: expectedYield and regionalAverage are PER ACRE and must be realistic for this crop in this region (for example potatoes in Atlantic Canada are roughly 12-18 tons/acre; wheat roughly 50-80 bushels/acre). revenueProjection is the TOTAL for the whole field in CAD. harvestDate must be the next realistic harvest for this crop and region, not necessarily this month. Return JSON with this exact structure:
{
  "expectedYield": { "low": <number>, "medium": <number>, "high": <number>, "unit": "bushels" or "tons" },
  "confidence": <number 0-100>,
  "harvestDate": "YYYY-MM-DD",
  "revenueProjection": { "low": <number>, "medium": <number>, "high": <number> },
  "factors": { "positive": ["factor1", "factor2"], "negative": ["factor1", "factor2"] },
  "regionalAverage": <number>,
  "recommendations": ["rec1", "rec2", "rec3"],
  "lastUpdated": "${currentDate}"
}`,
    });
  } catch (error) {
    console.error('Error in predictYield, using fallback:', error);
    return {
      expectedYield: {
        low: 120,
        medium: 150,
        high: 180,
        unit: crop.toLowerCase().includes('corn') || crop.toLowerCase().includes('wheat') ? 'bushels' : 'tons'
      },
      confidence: 50,
      harvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenueProjection: { low: 48000, medium: 60000, high: 72000 },
      factors: {
        positive: ['Sample data: AI prediction unavailable'],
        negative: ['Sample data: AI prediction unavailable']
      },
      regionalAverage: 145,
      recommendations: ['AI prediction unavailable. Check that ADAPTION_API_KEY is set and the dev server is running.'],
      lastUpdated: currentDate
    };
  }
};
