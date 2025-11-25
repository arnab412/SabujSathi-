import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PlantData } from "../types";

// Initialize Gemini Client
// The API key is obtained from the environment variable as per security best practices.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- QUOTA MANAGEMENT ---
const QUOTA_KEY = 'sobuj_sathi_daily_quota';
const DAILY_LIMIT = 1500; // Approximate free tier limit for Flash

export const getQuotaStats = () => {
  try {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(QUOTA_KEY);
    let data = { date: today, count: 0 };
    
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        data = parsed;
      }
    }
    return {
      used: data.count,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - data.count)
    };
  } catch {
    return { used: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
  }
};

const incrementQuota = () => {
  try {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(QUOTA_KEY);
    let count = 0;
    
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        count = parsed.count;
      }
    }
    
    localStorage.setItem(QUOTA_KEY, JSON.stringify({
      date: today,
      count: count + 1
    }));
  } catch (e) {
    console.error("Quota update failed", e);
  }
};

// --- LOCAL PLANT DATABASE FOR OFFLINE FALLBACK ---
const LOCAL_PLANT_DB: Record<string, PlantData> = {
  'rose': {
    name: "গোলাপ (Rose)",
    scientificName: "Rosa rubiginosa",
    water: "মাটি শুকিয়ে গেলে জল দিন",
    sunlight: "দিনে ৫-৬ ঘণ্টা কড়া রোদ",
    soil: "উর্বর দোআঁশ মাটি",
    care: "শুকনো ফুল কেটে ফেলুন।",
    disease: "সুস্থ ও সতেজ (Offline Analysis)",
    tips: ["মাসে একবার সরিষার খোল পচা জল দিন।", "ফাঙ্গাস লাগলে সাবান জল স্প্রে করুন।", "শীতকালে ডাল ছাঁটাই করুন।"]
  },
  'basil': {
    name: "তুলসী (Holy Basil)",
    scientificName: "Ocimum tenuiflorum",
    water: "প্রতিদিন সকালে অল্প জল দিন",
    sunlight: "সকালের রোদ পছন্দ করে",
    soil: "বেলে দোআঁশ মাটি",
    care: "মঞ্জরী (ফুল) ভেঙে দিন।",
    disease: "সুস্থ ও সতেজ (Offline Analysis)",
    tips: ["অতিরিক্ত জল দিলে শিকড় পচে যায়।", "শীতকালে কুয়াশা থেকে দূরে রাখুন।", "পাতা হলুদ হলে নাইট্রোজেন সার দিন।"]
  },
  'generic': {
    name: "অজানা গাছ (Unknown Plant)",
    scientificName: "Plant Detected",
    water: "মাটি পরীক্ষা করে জল দিন",
    sunlight: "পর্যাপ্ত আলো দিন",
    soil: "সাধারণ বাগান মাটি",
    care: "শুকনো পাতা পরিষ্কার রাখুন।",
    disease: "নিশ্চিত হওয়া যায়নি",
    tips: ["গাছের গোড়ায় আগাছা পরিষ্কার রাখুন।", "অতিরিক্ত রোদ বা ছায়া এ এড়িয়ে চলুন।", "বিনা প্রয়োজনে সার দেবেন না।"]
  }
};

const FALLBACK_TIPS = [
  "গাছের পাতায় ধুলো জমলে সালোকসংশ্লেষণে বাধা পায়, তাই পাতা পরিষ্কার রাখুন।",
  "অতিরিক্ত জল দিলে গাছের শিকড় পচে যেতে পারে, তাই মাটি শুকিয়ে গেলে জল দিন।",
  "সকালের হালকা রোদ গাছের জন্য সবচেয়ে ভালো, দুপুরের কড়া রোদ এড়িয়ে চলুন।",
  "শুকনো ফুল ও পাতা নিয়মিত ছেঁটে ফেললে গাছের বৃদ্ধি ভালো হয়।",
  "নিম তেল প্রাকৃতিকভাবে পোকা দমনে খুব কার্যকরী।",
  "গাছের গোড়ায় জল জমতে দেবেন না, এতে শিকড় পচে যায়।"
];

const FALLBACK_MISSIONS = [
  {
    id: 'fallback_1',
    label: 'পাতা পরিষ্কার',
    sub: 'Clean Leaves',
    desc: 'ভেজা কাপড় দিয়ে গাছের বড় পাতাগুলো মুছে দিন।',
    xp: 50,
    iconName: 'Leaf',
    colorTheme: 'green'
  },
  {
     id: 'fallback_2',
     label: 'আগাছা দমন',
     sub: 'Weeding',
     desc: 'টবের মাটি থেকে অপ্রয়োজনীয় ঘাস তুলে ফেলুন।',
     xp: 60,
     iconName: 'Sprout',
     colorTheme: 'orange'
  }
];

// Helper to identify quota errors
const isQuotaError = (error: any): boolean => {
  try {
    const errStr = (error?.message || '') + ' ' + (typeof error === 'object' ? JSON.stringify(error) : String(error));
    const lower = errStr.toLowerCase();
    return lower.includes('429') || 
           lower.includes('quota') || 
           lower.includes('resource_exhausted') ||
           lower.includes('too many requests');
  } catch {
    return false;
  }
};

// --- PLANT IDENTIFICATION ---
export const identifyPlant = async (base64Image: string, mimeType: string): Promise<PlantData> => {
  incrementQuota();
  try {
    const plantSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Common Name in Bengali followed by English in brackets" },
        scientificName: { type: Type.STRING, description: "Scientific Name" },
        water: { type: Type.STRING, description: "Watering instructions in Bengali using 'জল'" },
        sunlight: { type: Type.STRING, description: "Sunlight needs in Bengali" },
        soil: { type: Type.STRING, description: "Soil type in Bengali" },
        care: { type: Type.STRING, description: "Short care tip in Bengali" },
        disease: { type: Type.STRING, description: "Visual diagnosis of plant health in Bengali" },
        tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 specific care tips in Bengali" }
      },
      required: ["name", "scientificName", "water", "sunlight", "soil", "care", "disease", "tips"]
    };

    const prompt = `Identify this plant. Provide the output in strictly valid JSON format matching the schema.
    If it is not a plant, return "name": "NOT_PLANT".
    If image is too blurry, return "name": "BLURRY".
    IMPORTANT: Use the Bengali word 'জল' instead of 'পানি' everywhere.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: plantSchema,
        systemInstruction: "You are a Botanist. Reply in Bengali (except scientific names)."
      }
    });

    const data = JSON.parse(response.text || "{}");

    if (data.name === 'NOT_PLANT') throw new Error("এটি কোনো গাছ মনে হচ্ছে না।");
    if (data.name === 'BLURRY') throw new Error("ছবিটি অস্পষ্ট।");
    if (!data.name) throw new Error("Could not identify plant.");

    return data as PlantData;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Fallback to local offline logic only if strict API failure
    if (isQuotaError(error) || error.message.includes('fetch')) {
       console.warn("Using Offline Fallback due to API limits.");
       return {
         ...LOCAL_PLANT_DB['generic'],
         disease: "সার্ভার ব্যস্ত (Offline Mode)",
         scientificName: "System Offline"
       };
    }
    throw error;
  }
};

// --- CHAT BOT ---
export const sendChatMessage = async (message: string, history: { role: string; parts: { text: string }[] }[]) => {
  incrementQuota();
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: "You are Sobuj Sathi, a cheerful gardening friend. Reply in Bengali. Use gardening idioms. Be concise (max 30 words). ALWAYS use 'জল' instead of 'পানি'.",
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error: any) {
    if (isQuotaError(error)) {
        return "দুঃখিত বন্ধু! সার্ভার এখন খুব ব্যস্ত। আমি এখন বিশ্রাম নিচ্ছি। 🌿 (Quota Exceeded)";
    }
    return "দুঃখিত, সংযোগে সমস্যা হচ্ছে।";
  }
};

// --- GARDENING TIP ---
export const getGardeningTip = async (): Promise<string> => {
  incrementQuota();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me one short, unique gardening tip in Bengali. Keep it under 20 words.",
    });
    return response.text || FALLBACK_TIPS[0];
  } catch (error) {
    return FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
  }
};

// --- NEW MISSION GENERATOR ---
export const generateNewMission = async (): Promise<any> => {
  incrementQuota();
  try {
    const missionSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING },
        sub: { type: Type.STRING },
        desc: { type: Type.STRING },
        xp: { type: Type.INTEGER },
        iconName: { type: Type.STRING },
        colorTheme: { type: Type.STRING }
      },
      required: ["label", "sub", "desc", "xp", "iconName", "colorTheme"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate one unique, eco-friendly daily mission.",
      config: {
        responseMimeType: "application/json",
        responseSchema: missionSchema,
        systemInstruction: "Output JSON with fields: label (Bengali), sub (English), desc (Bengali), xp (30-100), iconName (Leaf, Droplets, Sun, Wind, Sprout, Bug, Bird, Recycle, Heart), colorTheme (green, blue, orange, red, yellow)."
      }
    });

    const mission = JSON.parse(response.text || "{}");
    if (!mission.label) throw new Error("Invalid mission data");

    return { ...mission, id: `mission_${Date.now()}` };
  } catch (error) {
    const randomMission = FALLBACK_MISSIONS[Math.floor(Math.random() * FALLBACK_MISSIONS.length)];
    return { ...randomMission, id: `mission_fallback_${Date.now()}` };
  }
};

// --- IMAGE GENERATION (NANO BANANA / GEMINI FLASH IMAGE) ---
export const generatePlantImage = async (stage: string): Promise<string> => {
  incrementQuota();
  try {
    const prompt = `A cute, high-quality, 3D isometric render of a plant in the ${stage} stage. 
    The plant should look healthy and vibrant. 
    Dark blue or black background to match a dark mode app UI. 
    Cinematic lighting, glowing green details.`;

    // Using gemini-2.5-flash-image (Nano Banana)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image Gen Error:", error);
    // Return empty to allow fallback
    return "";
  }
};