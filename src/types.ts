export interface Crater {
  id: string;
  lat: number;
  lng: number;
  type: 'impact' | 'structure' | 'unknown';
  confidence: number;
  radius_meters?: number;
  description: string;
  timestamp: string;
}

export interface RangeInfo {
  name: string;
  description: string;
  history: string;
  hazards: string[];
}
