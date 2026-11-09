
export type CropType = 'corn' | 'wheat' | 'tomato' | 'soybean';
export type SoilType = 'clay' | 'sandy' | 'loamy' | 'silt' | 'peaty' | 'chalky';

export interface RiskRequest {
  latitude: number;
  longitude: number;
  cropType: CropType;
  soilType: SoilType;
}

export interface WeatherDataPoint {
  date: string;
  maxTemp: number;
  precipitation: number;
}

export interface NDVIPoint {
  date: string;
  value: number;
}

export interface ForecastDataPoint {
  date: string;
  temp: number;
  condition: string;
}

export interface PlantingSuggestion {
  crop: string;
  suitability: 'High' | 'Medium';
  reason: string;
  imageUrl?: string;
}

export interface RiskAssessment {
  score: number;
  category: 'Low' | 'Moderate' | 'High' | 'Severe';
  indices: {
    heatStress: number;
    droughtIndex: number;
    vegetationStress: number;
  };
  ndvi: number;
  historicalData: WeatherDataPoint[];
  historicalNdvi: NDVIPoint[];
  forecast: ForecastDataPoint[];
  aiExplanation: string;
  plantingSuggestions: PlantingSuggestion[];
  timestamp: string;
}

export const CROP_MULTIPLIERS: Record<CropType, number> = {
  corn: 1.0,
  wheat: 0.9,
  tomato: 1.2,
  soybean: 1.1,
};
