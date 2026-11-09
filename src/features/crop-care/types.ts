
export interface CropRisk {
  label: string;
  score: number; // 0-100
  color: string;
  description: string;
}

export interface FarmState {
  cropType: string;
  location: string;
  fieldSize: string;
  risks: CropRisk[];
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  category: 'Irrigation' | 'Protection' | 'Harvest' | 'Soil';
}
