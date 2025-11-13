export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface NutritionalInfo {
  foodName: string;
  estimatedWeight: number; // in grams
  calories: number;
  protein: number;
  carbohydrates: {
    total: number;
    sugar: number;
  };
  fat: {
    total: number;
    saturated: number;
  };
  sodium: number; // in mg
  cholesterol: number; // in mg
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface FoodAnalysis {
  nutritionalInfo: NutritionalInfo;
  sources: GroundingSource[];
}

export interface Risk {
  score: number;
  reasoning: string;
}

export interface HealthRiskAssessment {
  diabetes: Risk;
  hypertension: Risk;
  cholesterol: Risk;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface HistoryEntry {
  analysis: FoodAnalysis;
  risks: HealthRiskAssessment;
  timestamp: string; // ISO 8601 string
  portionMultiplier: number;
}

export interface Settings {
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
  };
  mealReminders: {
    enabled: boolean;
    breakfast: string; // "HH:MM"
    lunch: string; // "HH:MM"
    dinner:string; // "HH:MM"
  };
}
