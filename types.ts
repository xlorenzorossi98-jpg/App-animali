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

export enum Role {
  ASSASSINO = 'Assassino',
  TANK = 'Tank',
  MAGO = 'Mago',
  COMBATTENTE = 'Combattente',
  SUPPORTO = 'Supporto'
}

export interface Card {
  id: string; // Unique ID for each *instance* of a card
  designKey: string; // Unique ID for the *design* of the card (e.g., "FELINO-LEGGENDARIA-0")
  name: string;
  description: string;
  rarity: Rarity;
  type: AnimalType;
  role: Role; // New: Role of the card
  attack: number;
  defense: number;
  hp: number;
  timestamp: number;
}

// Represents a unique slot in the album, defines what card *could* go there
export interface AlbumSlotDesign {
  designKey: string;
  rarity: Rarity;
  type: AnimalType;
  role: Role; // Updated to be required, as we assign roles to slots
}

// How the user's collection is stored: a map of designKey to the master card and its count
export type UserCollection = Record<string, { card: Card; count: number }>;

export interface CardSlot {
  designKey: string; // The unique identifier for this slot in the album
  rarity: Rarity;
  type: AnimalType;
  role: Role; // Updated to be required
  ownedCard?: Card; // The "master" card for this design if owned
  copies?: number;  // How many copies of this design the user has
}

export type AppView = 'home' | 'opening' | 'collection';

// --- Predefined Card Definitions ---
export const LOKI_CARD_BASE: Omit<Card, 'id' | 'timestamp'> = {
  designKey: 'FELINO-SUPER_RARA-LOKI',
  name: "Loki",
  description: "Conosciuto come l'essere più elegante del creato, Loki detto anche Lokito non combatte con la forza bruta, ma con la pura energia magica. È considerato il gatto più agile del mondo: i suoi movimenti sono così fluidi e veloci che sembra trovarsi in due posti contemporaneamente. La sua difesa non deriva dalla robustezza, ma dalla sua capacità di creare barriere di luce bianca e specchi d'ombra nera che deviano ogni proiettile. Un singolo movimento della sua coda può scatenare esplosioni arcane capaci di polverizzare intere fortificazioni.",
  rarity: Rarity.SUPER_RARA,
  type: AnimalType.FELINO,
  role: Role.MAGO,
  attack: 200,
  defense: 100,
  hp: 60,
};

export const MORGATH_CARD_BASE: Omit<Card, 'id' | 'timestamp'> = {
  designKey: 'FELINO-RARA-MORGATH',
  name: "Morgath",
  description: "Un assassino letale che colpisce dai piani dimensionali. È estremamente fragile, ma il suo graffio può recidere l'anima stessa del nemico.",
  rarity: Rarity.RARA,
  type: AnimalType.FELINO,
  role: Role.ASSASSINO,
  attack: 185,
  defense: 40,
  hp: 90,
};

export const MARCELLO_CARD_BASE: Omit<Card, 'id' | 'timestamp'> = {
  designKey: 'FELINO-RARA-MARCELLO',
  name: "Marcello",
  description: "Un gattone massiccio dal pelo grigio cenere e folto, simile a roccia granitica. Porta una piccola armatura d'oro sulle spalle.",
  rarity: Rarity.RARA,
  type: AnimalType.FELINO,
  role: Role.TANK,
  attack: 60,
  defense: 195,
  hp: 180,
};

export const MARGOT_CARD_BASE: Omit<Card, 'id' | 'timestamp'> = {
  designKey: 'FELINO-RARA-MARGOT',
  name: "Margot",
  description: "Una gatta dal pelo nero con sfumature arancioni molto aggressiva.",
  rarity: Rarity.RARA,
  type: AnimalType.FELINO,
  role: Role.COMBATTENTE,
  attack: 120,
  defense: 120,
  hp: 120,
};

export const ROMEO_CARD_BASE: Omit<Card, 'id' | 'timestamp'> = {
  designKey: 'FELINO-SUPER_RARA-ROMEO',
  name: "Romeo",
  description: "Considerato da poeti e viaggiatori come il gatto più bello di tutti i regni conosciuti. Romeo non ama combattere e i suoi attacchi sono poco più che gentili spinte, ma la sua grazia è tale che i nemici esitano a colpirlo, trovando quasi impossibile scalfire la sua maestosa presenza. La sua folta pelliccia sembra agire come uno scudo naturale, respingendo ogni male con un semplice e regale battito di ciglia.",
  rarity: Rarity.SUPER_RARA,
  type: AnimalType.FELINO,
  role: Role.TANK,
  attack: 50,
  defense: 200,
  hp: 200,
};

export const BUCK_CARD_BASE: Omit<Card, 'id' | 'timestamp'> = {
  designKey: 'FELINO-LEGGENDARIA-BUCK',
  name: "Buck",
  description: "Non lasciarti ingannare dalla sua ferita: Buck ha affinato l'udito e l'olfatto al punto da percepire lo spostamento d'aria di una freccia prima ancora che venga scoccata. È un turbine di artigli arancioni che danza tra i colpi nemici con un'agilità miracolosa. La sua pelle è dura come cuoio bollito, rendendolo un guerriero d'elite, capace di distruggere le difese avversarie e incassare colpi pesanti senza battere ciglio.",
  rarity: Rarity.LEGGENDARIA,
  type: AnimalType.FELINO,
  role: Role.COMBATTENTE,
  attack: 200,
  defense: 180,
  hp: 190,
};

export const MAMMA_DI_BUCK_CARD_BASE: Omit<Card, 'id' | 'timestamp'> = {
  designKey: 'FELINO-NON_COMUNE-MAMMA_DI_BUCK',
  name: "Mamma di Buck",
  description: "Scomparsa dai miti per decenni, Mamma di Buck è la radice da cui è sbocciata la forza del grande Buck. La sua vera potenza è avvolta nel mistero: le leggende narrano che non abbia bisogno di lottare, poiché la sua sola presenza altera l'esito della battaglia. Si dice che la sua forza non sia svanita, ma solo nascosta, pronta a risvegliarsi se la sua stirpe fosse in pericolo. Finché non colpisce, il suo valore di combattimento rimane un enigma che terrorizza gli avversari.",
  rarity: Rarity.NON_COMUNE,
  type: AnimalType.FELINO,
  role: Role.MAGO,
  attack: 50,
  defense: 50,
  hp: 100,
};

export const PITBULL_CARD_BASE: Omit<Card, 'id' | 'timestamp'> = {
  designKey: 'FELINO-NON_COMUNE-PITBULL',
  name: "Pitbull",
  description: "Nonostante sia nato da pochi giorni, Pitbull possiede una forza fisica inspiegabile e una mascella dalla presa d'acciaio che gli è valsa il suo soprannome. È una forza della natura intrappolata in un corpo minuscolo: i suoi piccoli balzi hanno la potenza di un ariete e non conosce il significato della parola paura. Sebbene sia fragile a causa della sua stazza, chiunque sottovaluti questo \"neonato\" finisce per pentirsene amaramente prima ancora che lui possa emettere il suo primo vero miagolio si pensa possa prendere il posto di Buck",
  rarity: Rarity.NON_COMUNE,
  type: AnimalType.FELINO,
  role: Role.ASSASSINO,
  attack: 110,
  defense: 50,
  hp: 50,
};

export const SGUATTERO_CARD_BASE: Omit<Card, 'id' | 'timestamp'> = {
  designKey: 'FELINO-COMUNE-SGUATTERO',
  name: "Sguattero",
  description: "Sguattero non ha poteri magici o discendenze reali, ma possiede l'astuzia della strada. È un esperto nel rubare oggetti agli avversari e nel dileguarsi tra le ombre prima che possano reagire. La sua forza risiede nella velocità e nella capacità di colpire i punti deboli quando il nemico è distratto.",
  rarity: Rarity.COMUNE,
  type: AnimalType.FELINO,
  role: Role.MAGO,
  attack: 30,
  defense: 10,
  hp: 50,
};

export const RUGGINE_CARD_BASE: Omit<Card, 'id' | 'timestamp'> = {
  designKey: 'FELINO-COMUNE-RUGGINE',
  name: "Ruggine",
  description: "Ruggine è una gatta di poche parole e molti fatti. È abituata a difendere il suo piccolo territorio contro cani e altri randagi, il che l'ha resa insolitamente resistente per essere un gatto comune. Non è molto veloce, ma se decide di non farti passare, dovrai sudare parecchio per spostarla.",
  rarity: Rarity.COMUNE,
  type: AnimalType.FELINO,
  role: Role.TANK,
  attack: 10,
  defense: 100,
  hp: 80,
};

// Map of all predefined cards by their designKey
export const ALL_PREDEFINED_CARDS_BASE: Record<string, Omit<Card, 'id' | 'timestamp'>> = {
  [LOKI_CARD_BASE.designKey]: LOKI_CARD_BASE,
  [MORGATH_CARD_BASE.designKey]: MORGATH_CARD_BASE,
  [MARCELLO_CARD_BASE.designKey]: MARCELLO_CARD_BASE,
  [MARGOT_CARD_BASE.designKey]: MARGOT_CARD_BASE,
  [ROMEO_CARD_BASE.designKey]: ROMEO_CARD_BASE,
  [BUCK_CARD_BASE.designKey]: BUCK_CARD_BASE,
  [MAMMA_DI_BUCK_CARD_BASE.designKey]: MAMMA_DI_BUCK_CARD_BASE,
  [PITBULL_CARD_BASE.designKey]: PITBULL_CARD_BASE,
  [SGUATTERO_CARD_BASE.designKey]: SGUATTERO_CARD_BASE,
  [RUGGINE_CARD_BASE.designKey]: RUGGINE_CARD_BASE,
};