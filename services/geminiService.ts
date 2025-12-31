import { Type, GenerateContentResponse } from "@google/genai";
import { Rarity, AnimalType, Card, Role, ALL_PREDEFINED_CARDS_BASE } from "../types";

// Re-instantiate GoogleGenAI where it's actually needed, e.g., in App.tsx for generating cards
// For now, let's assume `ai` will be passed or instantiated locally where content generation is required.

const WEIGHTS = {
  [Rarity.COMUNE]: 80,
  [Rarity.NON_COMUNE]: 40,
  [Rarity.RARA]: 20,
  [Rarity.SUPER_RARA]: 5,
  [Rarity.LEGGENDARIA]: 1
};

const getRandomRarity = (pool: Rarity[]): Rarity => {
  const totalWeight = pool.reduce((sum, r) => sum + WEIGHTS[r], 0);
  let random = Math.random() * totalWeight;
  
  for (const rarity of pool) {
    if (random < WEIGHTS[rarity]) return rarity;
    random -= WEIGHTS[rarity];
  }
  return pool[0]; // Fallback, should not happen with a non-empty pool
};

export const generatePackContents = async (theme: string, packId: string): Promise<{ cards: Card[], isGold: boolean }> => {
  const rarities: Rarity[] = [];

  const highRarityPool = [Rarity.RARA, Rarity.SUPER_RARA, Rarity.LEGGENDARIA];
  const fullPool = [Rarity.COMUNE, Rarity.NON_COMUNE, Rarity.RARA, Rarity.SUPER_RARA, Rarity.LEGGENDARIA];

  // Guarantee one Rara or higher
  rarities.push(getRandomRarity(highRarityPool));
  
  // Generate the remaining 4 cards from the full pool
  for (let i = 0; i < 4; i++) {
    rarities.push(getRandomRarity(fullPool));
  }

  const packCards: Card[] = [];

  for (const targetRarity of rarities) {
    let cardData: Omit<Card, 'id' | 'timestamp'> | null = null;

    // For packs, we're generating new cards or picking from predefined
    // Since images are removed, the logic simplifies to just getting the card data
    const predefinedCardKeys = Object.keys(ALL_PREDEFINED_CARDS_BASE);
    if (predefinedCardKeys.length > 0) {
      const randomPredefinedKey = predefinedCardKeys[Math.floor(Math.random() * predefinedCardKeys.length)];
      cardData = ALL_PREDEFINED_CARDS_BASE[randomPredefinedKey];
    }

    if (cardData) {
      packCards.push({
        ...cardData,
        id: `instance-${Date.now()}-${packCards.length}-${Math.floor(Math.random() * 1000000)}`,
        timestamp: Date.now()
      });
    } else {
      console.error("No predefined cards available to draw from for pack!");
      // As a last resort, push a generic placeholder if all else fails, to prevent errors
      packCards.push({
        name: "Carta Sconosciuta",
        description: "Errore durante l'estrazione della carta.",
        rarity: Rarity.COMUNE,
        type: AnimalType.FELINO, 
        role: Role.SUPPORTO,
        attack: 0, defense: 0, hp: 0,
        designKey: `ERROR-${Date.now()}`,
        id: `instance-error-${Date.now()}-${packCards.length}`,
        timestamp: Date.now()
      });
    }
  }

  // Determine if it's a "gold pack" based on the rarities of the generated cards
  const hasHighRarity = packCards.some(r => r.rarity === Rarity.LEGGENDARIA || r.rarity === Rarity.SUPER_RARA);
  
  return { cards: packCards, isGold: hasHighRarity };
};

export const generateSingleCard = async (rarity: Rarity, type: AnimalType, designKeyToUnlock?: string): Promise<Card | null> => {
  // Move GoogleGenAI instantiation to App.tsx if still needed for other text tasks
  // For now, let's assume it's directly accessible here for simplicity or that this function
  // will be called from a context where `ai` is available.
  // Since we removed image generation, the `ai` instance is not strictly needed here for now.
  // If text generation is still desired for *dynamic* cards (not predefined), we'd need it.
  // For this context, we will simply return the predefined card if designKeyToUnlock is provided.
  // If no designKeyToUnlock, we can assume this function is not meant for fully dynamic new card generation anymore
  // without a prompt.

  let cardBase: Omit<Card, 'id' | 'timestamp'> | null = null;

  if (designKeyToUnlock && ALL_PREDEFINED_CARDS_BASE[designKeyToUnlock]) {
    cardBase = { ...ALL_PREDEFINED_CARDS_BASE[designKeyToUnlock] }; // Copy all properties
  } else {
    // If no designKeyToUnlock, we need to generate a dynamic card.
    // Re-introduce GoogleGenAI if dynamic card generation is desired without a specific predefined key.
    // For this change, we'll simplify and only allow unlocking predefined or pack-generated predefined-like cards.
    console.error("generateSingleCard called without a predefined designKeyToUnlock and no dynamic generation logic.");
    return null;
  }

  if (!cardBase) return null;

  return {
    ...cardBase,
    id: `instance-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
    timestamp: Date.now(),
  };
};