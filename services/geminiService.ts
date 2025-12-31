
import { GoogleGenAI, Type } from "@google/genai";
import { Rarity, AnimalType, Card } from "../types";

const WEIGHTS = {
  [Rarity.COMUNE]: 50,
  [Rarity.NON_COMUNE]: 35,
  [Rarity.RARA]: 20,
  [Rarity.SUPER_RARA]: 10,
  [Rarity.LEGGENDARIA]: 5
};

const getRandomRarity = (pool: Rarity[]): Rarity => {
  const totalWeight = pool.reduce((sum, r) => sum + WEIGHTS[r], 0);
  let random = Math.random() * totalWeight;
  
  for (const rarity of pool) {
    if (random < WEIGHTS[rarity]) return rarity;
    random -= WEIGHTS[rarity];
  }
  return pool[0];
};

export const generatePackImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Digital art of a TCG card pack cover. Theme: ${prompt}. Cinematic lighting, high fantasy style, epic composition, vibrant colors. NO UI, NO TEXT, NO BORDERS.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    console.warn("No image data found in response parts for pack image.");
  } catch (error) {
    console.error("Critical error in generatePackImage:", error);
  }
  // Robust fallback for pack images using Unsplash
  return `https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=400&auto=format&fit=crop`;
};

export const generateCardImage = async (name: string, type: string, description: string, customPrompt?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const promptText = customPrompt || `Fantasy illustration for a TCG card named "${name}". It is a ${type} creature. Lore: ${description}. Digital art, vibrant colors, detailed environment. NO TEXT, NO CARD FRAME.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: promptText,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error) {
    console.error("Card image generation failed, using fallback:", error);
  }
  
  // Safe fallback using Unsplash
  return `https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=400&auto=format&fit=crop`;
};

export const generatePackContents = async (theme: string, packId: string): Promise<{ cards: Card[], isGold: boolean }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isGold = Math.random() < 0.01;
  const rarities: Rarity[] = [];

  const highRarityPool = [Rarity.RARA, Rarity.SUPER_RARA, Rarity.LEGGENDARIA];
  const fullPool = [Rarity.COMUNE, Rarity.NON_COMUNE, Rarity.RARA, Rarity.SUPER_RARA, Rarity.LEGGENDARIA];

  if (isGold) {
    for (let i = 0; i < 5; i++) rarities.push(getRandomRarity(highRarityPool));
  } else {
    rarities.push(getRandomRarity(highRarityPool));
    for (let i = 0; i < 4; i++) rarities.push(getRandomRarity(fullPool));
  }

  rarities.sort(() => Math.random() - 0.5);

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera 5 carte collezionabili basate su questo tema: ${theme}. 
    Focus: Creature animali uniche e fantastiche.
    Lingua: ITALIANO.
    Tipi ammessi: [${Object.values(AnimalType).join(", ")}].
    DEVI assegnare esattamente queste rarità nell'ordine fornito: [${rarities.join(", ")}].
    Ogni oggetto deve avere: name, description (lore epica), type, attack, defense e hp.
    Le statistiche devono essere coerenti con la rarità.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            rarity: { type: Type.STRING, enum: Object.values(Rarity) },
            type: { type: Type.STRING, enum: Object.values(AnimalType) },
            attack: { type: Type.INTEGER },
            defense: { type: Type.INTEGER },
            hp: { type: Type.INTEGER }
          },
          required: ["name", "description", "rarity", "type", "attack", "defense", "hp"]
        }
      }
    }
  });

  const jsonStr = response.text?.trim() || "[]";
  let rawCards = [];
  try {
    // Handle potential markdown code blocks in response text
    const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    rawCards = JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse cards JSON:", e, jsonStr);
    rawCards = [];
  }
  
  if (packId === 'legendary-lokito' && rawCards.length > 0) {
    const lokitoCard = {
      name: "Lokito",
      description: "Il carismatico condottiero dal manto bianco e nero. Comanda con uno sguardo un incredibile esercito di squali, cani e insetti.",
      rarity: Rarity.LEGGENDARIA,
      type: AnimalType.FELINO,
      attack: 110,
      defense: 50,
      hp: 90,
      customImagePrompt: "Epic portrait of a powerful black and white cat with glowing emerald green eyes. It is surrounded by blurred silhouettes of sharks, dogs, and birds, looking like a mythical leader. Fantasy TCG art style. NO TEXT."
    };
    rawCards[0] = lokitoCard;
  }

  const cards = await Promise.all(rawCards.map(async (c: any, index: number) => {
    const imageUrl = await generateCardImage(c.name, c.type, c.description, c.customImagePrompt);
    
    return {
      ...c,
      rarity: c.rarity as Rarity,
      id: `card-${Date.now()}-${index}-${Math.floor(Math.random() * 1000000)}`,
      imageUrl,
      timestamp: Date.now()
    };
  }));

  return { cards, isGold };
};
