
export enum Rarity {
  COMUNE = 'comune',
  NON_COMUNE = 'non comune',
  RARA = 'rara',
  SUPER_RARA = 'super rara',
  LEGGENDARIA = 'leggendaria'
}

export enum AnimalType {
  FELINO = 'Felino',
  CANE = 'Cane',
  VOLATILE = 'Volatile',
  INSETTO = 'Insetto',
  RODITORE = 'Roditore',
  PESCE = 'Pesce',
  RETTILE = 'Rettile'
}

export interface Card {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  type: AnimalType;
  attack: number;
  defense: number;
  hp: number;
  imageUrl: string;
  timestamp: number;
}

export type AppView = 'home' | 'opening' | 'collection';
