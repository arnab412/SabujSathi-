export interface PlantData {
  name: string;
  scientificName: string;
  water: string;
  sunlight: string;
  soil: string;
  care: string;
  disease: string;
  tips: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  HOME = 'HOME',
  ANALYZE = 'ANALYZE',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE'
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  lastCheckIn: number; // Timestamp
  unlockedCards: number[]; // IDs of unlocked knowledge cards
  impactStats: {
    water: number;
    oxygen: number;
    carbon: number;
  };
}