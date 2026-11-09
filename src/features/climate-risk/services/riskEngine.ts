import {
  RiskRequest,
  RiskAssessment,
  WeatherDataPoint,
  ForecastDataPoint,
  CROP_MULTIPLIERS,
  CropType,
  SoilType,
  PlantingSuggestion,
  NDVIPoint
} from '../types';

// AI calls go through the shared Adaption client (key stays server-side).
import { aiText, aiJSON, AI_ENABLED } from "../../../services/ai";

export const calculateRisk = async (req: RiskRequest): Promise<RiskAssessment> => {
  const { latitude, longitude, cropType, soilType } = req;

  const [historical, forecast] = await Promise.all([
    fetchHistoricalWeather(latitude, longitude),
    fetchForecastWeather(latitude, longitude)
  ]);

  const historicalNdvi = generateHistoricalNdvi(historical.map(h => h.date));
  const latestNdvi = historicalNdvi[historicalNdvi.length - 1]?.value || 0.5;

  const avgMaxTemp = historical.reduce((acc, d) => acc + d.maxTemp, 0) / historical.length;
  const forecastHeatWaves = forecast.filter(f => f.temp > 35).length;
  const baseHeat = Math.min(Math.max((avgMaxTemp - 15) / 25, 0), 1);
  const heatStress = Math.min(baseHeat + (forecastHeatWaves * 0.1), 1);

  const totalRain = historical.reduce((acc, d) => acc + d.precipitation, 0);
  const droughtIndex = Math.min(Math.max((100 - totalRain) / 100, 0), 1);

  const vegetationStress = Math.min(Math.max((0.8 - latestNdvi) / 0.6, 0), 1);

  let rawScore = (0.4 * heatStress) + (0.35 * droughtIndex) + (0.25 * vegetationStress);
  const multiplier = CROP_MULTIPLIERS[cropType];
  const finalScore = Math.min(Math.round(rawScore * 100 * multiplier), 100);

  let category: RiskAssessment['category'] = 'Low';
  if (finalScore > 75) category = 'Severe';
  else if (finalScore > 50) category = 'High';
  else if (finalScore > 25) category = 'Moderate';

  const [aiExplanation, baseSuggestions] = await Promise.all([
    generateAIExplanation(cropType, soilType, finalScore, { heatStress, droughtIndex, vegetationStress }, latestNdvi),
    generatePlantingSuggestions(latitude, longitude, soilType, historical, forecast)
  ]);

  const plantingSuggestions = await Promise.all(
    baseSuggestions.map(async (suggestion) => {
      const images = await fetchPlantImages(suggestion.crop);
      return { ...suggestion, imageUrl: images?.[0] || null };
    })
  );

  return {
    score: finalScore,
    category,
    indices: {
      heatStress: Number(heatStress.toFixed(2)),
      droughtIndex: Number(droughtIndex.toFixed(2)),
      vegetationStress: Number(vegetationStress.toFixed(2))
    },
    ndvi: Number(latestNdvi.toFixed(2)),
    historicalData: historical,
    historicalNdvi,
    forecast,
    aiExplanation,
    plantingSuggestions,
    timestamp: new Date().toISOString()
  };
};

function generateHistoricalNdvi(dates: string[]): NDVIPoint[] {
  let currentVal = Math.random() * (0.7 - 0.4) + 0.4;
  return dates.map(date => {
    const change = (Math.random() - 0.5) * 0.05;
    currentVal = Math.max(0.2, Math.min(0.85, currentVal + change));
    return { date, value: Number(currentVal.toFixed(3)) };
  });
}

// ---------------- AI EXPLANATIONS ----------------

async function generateAIExplanation(
  crop: CropType,
  soil: SoilType,
  score: number,
  indices: { heatStress: number; droughtIndex: number; vegetationStress: number },
  ndvi: number
): Promise<string> {

  if (!AI_ENABLED) {
    return `Analysis for ${crop} in ${soil} soil indicates a ${score}/100 risk level. Moisture management is important.`;
  }

  try {
    const text = await aiText({
      system: "You are an agricultural climate risk expert. Write in plain language for a small-scale farmer.",
      temperature: 0.6,
      prompt: `
Generate a 2-3 sentence professional climate risk explanation for a farmer growing ${crop} in ${soil} soil.

Risk Score: ${score}/100
Heat Stress: ${indices.heatStress}
Drought Index: ${indices.droughtIndex}
Vegetation Stress: ${indices.vegetationStress}
NDVI: ${ndvi} (estimated, not from satellite)
`,
    });
    return text || "AI insights unavailable.";
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return "Insights unavailable.";
  }
}

// ---------------- PLANTING SUGGESTIONS ----------------

async function generatePlantingSuggestions(
  lat: number,
  lon: number,
  soil: SoilType,
  historical: WeatherDataPoint[],
  forecast: ForecastDataPoint[]
): Promise<PlantingSuggestion[]> {

  if (!AI_ENABLED) {
    return [
      { crop: 'Radishes', suitability: 'High', reason: 'Fast-growing and climate adaptable.' },
      { crop: 'Carrots', suitability: 'Medium', reason: `Performs well in ${soil} soil.` }
    ];
  }

  try {
    const recentRain = historical.reduce((acc, d) => acc + (d.precipitation || 0), 0).toFixed(0);
    const nextWeek = forecast.map(f => `${f.date}: ${f.temp}°C ${f.condition}`).join('; ');
    return await aiJSON({
      temperature: 0.5,
      prompt: `
Suggest 3 crops suitable for planting now (today is ${new Date().toISOString().slice(0, 10)}) at:
Latitude: ${lat}
Longitude: ${lon}
Soil: ${soil}
Rain in the last 30 days: ${recentRain} mm
Next 7 days: ${nextWeek}

Return a JSON array in this format:
[
  { "crop": "", "suitability": "High or Medium", "reason": "" }
]
`,
    });
  } catch (error) {
    console.error("Suggestions Error:", error);
    return [];
  }
}

// ---------------- PLANT IMAGES ----------------

async function fetchPlantImages(plantName: string): Promise<string[]> {
  // Wikipedia article thumbnail for the crop
  const placeholder = [`https://placehold.co/400x300/1e293b/94a3b8?text=${encodeURIComponent(plantName)}`];
  try {
    // "Winter Garlic" -> "Garlic", otherwise the search lands on "Winter wheat"
    const name = plantName.replace(/\b(winter|spring|summer|fall|autumn|early|late|hardy|cover)\b/gi, '').trim() || plantName;
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search` +
      `&gsrsearch=${encodeURIComponent(name)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=400`;
    const json = await (await fetch(url)).json();
    const page: any = Object.values(json.query?.pages || {})[0];
    return page?.thumbnail?.source ? [page.thumbnail.source] : placeholder;
  } catch (err) {
    console.error("Wikipedia image fetch error:", err);
    return placeholder;
  }
}

// ---------------- WEATHER DATA ----------------

async function fetchHistoricalWeather(lat: number, lon: number): Promise<WeatherDataPoint[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_max,precipitation_sum&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();
  if (!data.daily) return [];

  return data.daily.time.map((time: string, i: number) => ({
    date: time,
    maxTemp: data.daily.temperature_2m_max[i],
    precipitation: data.daily.precipitation_sum[i]
  }));
}

async function fetchForecastWeather(lat: number, lon: number): Promise<ForecastDataPoint[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();
  if (!data.daily) return [];

  return data.daily.time.map((time: string, i: number) => ({
    date: time,
    temp: data.daily.temperature_2m_max[i],
    condition: getWeatherCondition(data.daily.weathercode[i])
  }));
}

function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  return 'Stormy';
}