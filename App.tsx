import React, { useState, useEffect, useRef } from 'react';
import { Card, AppView, Rarity, AnimalType, CardSlot, UserCollection, AlbumSlotDesign, Role, LOKI_CARD_BASE, MORGATH_CARD_BASE, MARCELLO_CARD_BASE, MARGOT_CARD_BASE, ROMEO_CARD_BASE, BUCK_CARD_BASE, MAMMA_DI_BUCK_CARD_BASE, PITBULL_CARD_BASE, SGUATTERO_CARD_BASE, RUGGINE_CARD_BASE, ALL_PREDEFINED_CARDS_BASE } from './types';
import PackOpener from './components/PackOpener';
import CardComponent from './components/CardComponent';
import MissingCardPlaceholder from './components/MissingCardPlaceholder';
import { generateSingleCard } from './services/geminiService';
import { Zap, Coins, Clock, X, Filter, ChevronDown, Check, MousePointer2, AlertTriangle, Cat, Dog, Bird, Bug, Mouse, Fish, Turtle, Shield, Sword, Heart } from 'lucide-react';

const SELL_PRICES = {
  [Rarity.COMUNE]: 1,
  [Rarity.NON_COMUNE]: 5,
  [Rarity.RARA]: 10,
  [Rarity.SUPER_RARA]: 30,
  [Rarity.LEGGENDARIA]: 50
};

const UNLOCK_COST = 500; // Costo per sbloccare una carta direttamente

// Helper function to get AnimalType icon
const getAnimalTypeIcon = (type: AnimalType, size: number = 20) => {
  switch (type) {
    case AnimalType.FELINO: return <Cat size={size} />;
    case AnimalType.CANE: return <Dog size={size} />;
    case AnimalType.VOLATILE: return <Bird size={size} />;
    case AnimalType.INSETTO: return <Bug size={size} />;
    case AnimalType.RODITORE: return <Mouse size={size} />;
    case AnimalType.PESCE: return <Fish size={size} />;
    case AnimalType.RETTILE: return <Turtle size={size} />;
    default: return null;
  }
};

// Helper function to get Role icon
const getRoleIcon = (role: Role, size: number = 16) => {
  switch (role) {
    case Role.ASSASSINO: return <Sword size={size} />;
    case Role.TANK: return <Shield size={size} />;
    case Role.MAGO: return <Zap size={size} />;
    case Role.COMBATTENTE: return <Sword size={size} />; // Using sword for general fighter
    case Role.SUPPORTO: return <Heart size={size} />;
    default: return null;
  }
};

// --- Define all unique album slots ---
const ALL_ALBUM_SLOT_DESIGNS: AlbumSlotDesign[] = [];

// Add predefined slots first
Object.values(ALL_PREDEFINED_CARDS_BASE).forEach(cardData => {
  ALL_ALBUM_SLOT_DESIGNS.push({
    designKey: cardData.designKey,
    rarity: cardData.rarity,
    type: cardData.type,
    role: cardData.role,
  });
});

// Now, determine counts for dynamically generated slots
const BASE_RARITY_COUNTS_PER_TYPE: Record<Rarity, number> = {
  [Rarity.LEGGENDARIA]: 1, // Default 1 legendary per type
  [Rarity.SUPER_RARA]: 2,
  [Rarity.RARA]: 3,
  [Rarity.NON_COMUNE]: 2,
  [Rarity.COMUNE]: 2,
};

// Keep track of how many generic slots are needed per type/rarity after predefined ones
const genericSlotCounts: Record<AnimalType, Record<Rarity, number>> = Object.values(AnimalType).reduce((acc, type) => {
  acc[type] = { ...BASE_RARITY_COUNTS_PER_TYPE };
  return acc;
}, {} as Record<AnimalType, Record<Rarity, number>>);

// Decrement counts for predefined cards
Object.values(ALL_PREDEFINED_CARDS_BASE).forEach(cardData => {
  if (genericSlotCounts[cardData.type] && genericSlotCounts[cardData.type][cardData.rarity] > 0) {
    genericSlotCounts[cardData.type][cardData.rarity]--;
  }
});

let roleIndexCounter = 0; // To cycle through roles for generic cards only
Object.values(AnimalType).forEach(type => {
  (Object.keys(BASE_RARITY_COUNTS_PER_TYPE) as Rarity[]).forEach(rarity => {
    for (let i = 0; i < genericSlotCounts[type][rarity]; i++) {
      const currentRole = Object.values(Role)[roleIndexCounter % Object.values(Role).length];
      ALL_ALBUM_SLOT_DESIGNS.push({
        designKey: `${type}-${rarity.toUpperCase()}-GENERIC-${i}`, // Use GENERIC prefix
        rarity: rarity,
        type: type,
        role: currentRole,
      });
      roleIndexCounter++;
    }
  });
});
// --- End unique album slots definition ---


const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [collection, setCollection] = useState<UserCollection>({}); // Changed to UserCollection
  const [coins, setCoins] = useState(1000);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showInfo, setShowInfo] = useState(false);
  const [storageError, setStorageError] = useState(false);

  // Filtri
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AnimalType | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all'); // New role filter state
  const [isRarityFilterOpen, setIsRarityFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false); // New role filter dropdown state

  // Stato per lo sblocco diretto delle carte
  const [isUnlockingCardKey, setIsUnlockingCardKey] = useState<string | null>(null); // Now stores designKey
  
  // Stato per la visualizzazione in primo piano della carta
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedCardCopies, setSelectedCardCopies] = useState<number | undefined>(undefined);

  const rarityRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null); // New role filter ref

  // Removed API key status check on mount

  // Caricamento dati iniziale
  useEffect(() => {
    try {
      const savedCol = localStorage.getItem('zenith_collection');
      const savedCoins = localStorage.getItem('zenith_coins');
      // Migration from old array format to new UserCollection format if needed,
      // or simply load if already in new format.
      if (savedCol) {
        const parsedCollection = JSON.parse(savedCol);
        // Basic check to see if it's the old array format or new object format
        if (Array.isArray(parsedCollection)) {
          console.warn("Migrating old collection format to new UserCollection format...");
          const newCollection: UserCollection = {};
          parsedCollection.forEach((card: Card) => {
            // This basic migration won't assign specific designKeys if they weren't present.
            // For a robust migration, we'd need more logic, but for now, we'll assign a generic one
            // or let the user re-collect if the old cards didn't have designKey.
            // For simplicity in this challenge, we'll assume a fresh collection or
            // that existing cards will be treated as the first instance of a generic design.
            // In a real app, this would require a more sophisticated mapping.
            const genericDesignKey = `${card.type}-${card.rarity.toUpperCase()}-0_MIGRATED`;
            if (newCollection[genericDesignKey]) {
              newCollection[genericDesignKey].count += 1;
            } else {
              // Assign a default role for migrated cards, as old cards wouldn't have it
              // Fix: Assign an object with `card` and `count` properties, matching UserCollection type
              newCollection[genericDesignKey] = { card: { ...card, designKey: genericDesignKey, role: Role.COMBATTENTE }, count: 1 };
            }
          });
          setCollection(newCollection);
        } else {
          // If already in new format, ensure 'role' is present (fallback for older saves that might not have it)
          const updatedParsedCollection: UserCollection = {};
          for (const key in parsedCollection) {
            const entry = parsedCollection[key];
            if (!entry.card.role) {
              updatedParsedCollection[key] = {
                ...entry,
                card: { ...entry.card, role: Role.COMBATTENTE } // Assign default role if missing
              };
            } else {
              updatedParsedCollection[key] = entry;
            }
          }
          setCollection(updatedParsedCollection);
        }
      }
      if (savedCoins) setCoins(parseInt(savedCoins));
    } catch (e) {
      console.error("Errore caricamento dati:", e);
    }
  }, []);

  // Salvataggio monete
  useEffect(() => {
    try {
      localStorage.setItem('zenith_coins', coins.toString());
    } catch (e) {
      console.warn("Spazio insufficiente per salvare le monete");
    }
  }, [coins]);

  // Salvataggio collezione con gestione errore quota
  useEffect(() => {
    if (Object.keys(collection).length === 0) {
      try {
        localStorage.removeItem('zenith_collection'); // Clear if empty
        setStorageError(false);
      } catch (e) {
        console.error("Errore pulizia collezione (QuotaExceeded):", e);
        setStorageError(true);
      }
      return;
    }
    try {
      localStorage.setItem('zenith_collection', JSON.stringify(collection));
      setStorageError(false);
    } catch (e) {
      console.error("Errore persistenza collezione (QuotaExceeded):", e);
      setStorageError(true);
      // L'app non crasha più, ma avvisa l'utente se necessario
    }
  }, [collection]);

  // Chiudi i filtri se si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rarityRef.current && !rarityRef.current.contains(event.target as Node)) {
        setIsRarityFilterOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeFilterOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) { // New role filter close
        setIsRoleFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Timer per monete passive
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCoins(c => c + 10);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Effect for handling fullscreen card modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedCard) {
        setSelectedCard(null);
        setSelectedCardCopies(undefined);
      }
    };

    if (selectedCard) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedCard]);

  // Function to assign designKey and update collection
  const addCardsToCollection = (newCards: Omit<Card, 'designKey'>[]) => {
    setCollection(prevCollection => {
      const updatedCollection = { ...prevCollection };

      newCards.forEach(newCardData => {
        let targetDesignKey: string | undefined;

        // 1. Check if the generated card's properties match any predefined special card
        for (const predefinedKey in ALL_PREDEFINED_CARDS_BASE) {
          const predefinedCard = ALL_PREDEFINED_CARDS_BASE[predefinedKey];
          // Compare key properties to see if the generated card is a predefined one
          if (newCardData.name === predefinedCard.name &&
              newCardData.type === predefinedCard.type &&
              newCardData.rarity === predefinedCard.rarity &&
              newCardData.role === predefinedCard.role &&
              newCardData.attack === predefinedCard.attack &&
              newCardData.defense === predefinedCard.defense &&
              newCardData.hp === predefinedCard.hp) {
            targetDesignKey = predefinedKey; // Assign its specific designKey
            break;
          }
        }

        if (targetDesignKey) {
          // If it's a predefined card (or matches one)
          if (updatedCollection[targetDesignKey]) {
            updatedCollection[targetDesignKey].count += 1; // Increment count if already owned
          } else {
            const cardWithDesignKey: Card = { ...newCardData, designKey: targetDesignKey };
            updatedCollection[targetDesignKey] = { card: cardWithDesignKey, count: 1 }; // Add to its specific slot
          }
        } else {
          // 2. Not a predefined special card, assign to a generic slot
          const availableGenericSlots = ALL_ALBUM_SLOT_DESIGNS.filter(design =>
            design.designKey.includes('-GENERIC-') && // Only consider generic slots
            design.rarity === newCardData.rarity &&
            design.type === newCardData.type &&
            !updatedCollection[design.designKey] // Slot is unowned
          );

          if (availableGenericSlots.length > 0) {
            targetDesignKey = availableGenericSlots[0].designKey; // Fill the first available generic slot
            const cardWithDesignKey: Card = { ...newCardData, designKey: targetDesignKey };
            updatedCollection[targetDesignKey] = { card: cardWithDesignKey, count: 1 };
          } else {
            // 3. All matching generic slots are full. Treat as a copy of an existing generic card.
            const ownedGenericDesignsOfSameTypeRarity = ALL_ALBUM_SLOT_DESIGNS.filter(design =>
              design.designKey.includes('-GENERIC-') && // Only consider generic slots
              design.rarity === newCardData.rarity &&
              design.type === newCardData.type &&
              updatedCollection[design.designKey] // Slot is owned
            );

            if (ownedGenericDesignsOfSameTypeRarity.length > 0) {
              // Pick a random existing generic designKey to increment its count
              targetDesignKey = ownedGenericDesignsOfSameTypeRarity[Math.floor(Math.random() * ownedGenericDesignsOfSameTypeRarity.length)].designKey;
              updatedCollection[targetDesignKey].count += 1;
            } else {
              // Fallback: If no generic slot or predefined slot could be found/matched, create a generic duplicate.
              const genericDuplicateKey = `${newCardData.type}-${newCardData.rarity.toUpperCase()}-DUPLICATE-${Date.now()}`;
              console.warn(`Could not find a matching album slot for card. Creating generic duplicate entry: ${genericDuplicateKey}`);
              updatedCollection[genericDuplicateKey] = { card: { ...newCardData, designKey: genericDuplicateKey }, count: 1 };
            }
          }
        }
      });
      return updatedCollection;
    });
  };

  const handleSpendCoins = (amount: number) => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      return true;
    }
    return false;
  };

  // handleSellCard now takes designKey
  const handleSellCard = (designKey: string) => {
    setCollection(prevCollection => {
      const updatedCollection = { ...prevCollection };
      if (updatedCollection[designKey]) {
        const cardToSell = updatedCollection[designKey].card;
        const price = SELL_PRICES[cardToSell.rarity] || 0;
        setCoins(prev => prev + price);

        updatedCollection[designKey].count -= 1;
        if (updatedCollection[designKey].count <= 0) {
          delete updatedCollection[designKey];
        }
      }
      return updatedCollection;
    });
  };

  // Funzione per sbloccare una carta direttamente (ora con designKey)
  const handleUnlockCard = async (designKey: string) => {
    if (isUnlockingCardKey) return; // Removed hasApiKeySelected condition

    if (coins < UNLOCK_COST) {
      alert("Non hai abbastanza monete per sbloccare questa carta! Servono 500 monete.");
      return;
    }

    setIsUnlockingCardKey(designKey);
    let success = false;
    let refundedCoins = 0; // Track coins to refund

    try {
      const spent = handleSpendCoins(UNLOCK_COST);
      if (!spent) {
        alert("Errore durante la spesa delle monete.");
        return;
      }
      refundedCoins = UNLOCK_COST; // Mark for potential refund

      const albumDesign = ALL_ALBUM_SLOT_DESIGNS.find(d => d.designKey === designKey);
      if (!albumDesign) {
        throw new Error(`DesignKey non trovato: ${designKey}`);
      }
      
      // Pass designKey to generateSingleCard. It will return predefined card if matching.
      const newCardData = await generateSingleCard(albumDesign.rarity, albumDesign.type, designKey); 

      if (newCardData) {
        setCollection(prevCollection => {
          const updatedCollection = { ...prevCollection };
          // This card is explicitly filling this designKey slot
          const cardWithDesignKey: Card = { ...newCardData, designKey: designKey };
          updatedCollection[designKey] = { card: cardWithDesignKey, count: 1 };
          return updatedCollection;
        });
        success = true;
        refundedCoins = 0; // No refund needed
      } else {
        alert("Errore nella generazione della carta. Riprova!");
      }
    } catch (error) {
      console.error("Errore durante lo sblocco della carta:", error);
      // Removed specific API key error check
      alert("Si è verificato un errore inaspettato. Riprova.");
    } finally {
      setIsUnlockingCardKey(null);
      if (!success && refundedCoins > 0) {
        setCoins(prev => prev + refundedCoins); // Refund coins if unlock failed
      }
    }
  };

  // Funzione per mostrare la carta in primo piano
  const handleCardClick = (card: Card, copies: number | undefined) => {
    setSelectedCard(card);
    setSelectedCardCopies(copies);
  };

  const getRarityLabel = (r: Rarity | 'all') => r === 'all' ? 'Rarità' : r.charAt(0).toUpperCase() + r.slice(1);
  const getTypeLabel = (t: AnimalType | 'all') => t === 'all' ? 'Tipo' : t;
  const getRoleLabel = (r: Role | 'all') => r === 'all' ? 'Ruolo' : r.charAt(0).toUpperCase() + r.slice(1); // New helper

  // Removed function to open the API key selection dialog

  // --- Album Structure Logic ---
  const structuredAlbum = Object.values(AnimalType).reduce((acc, type) => {
    const typeSlots: CardSlot[] = ALL_ALBUM_SLOT_DESIGNS
      .filter(design => design.type === type)
      .sort((a, b) => { // Ensure consistent sorting for rarities within a type
        const rarityOrderMap = {
          [Rarity.LEGGENDARIA]: 0,
          [Rarity.SUPER_RARA]: 1,
          [Rarity.RARA]: 2,
          [Rarity.NON_COMUNE]: 3,
          [Rarity.COMUNE]: 4,
        };
        // Also sort by role for consistent display if there are multiple slots of same rarity/type
        const roleOrderMap = {
          [Role.COMBATTENTE]: 0, // Margot & Buck (Combattente)
          [Role.ASSASSINO]: 1,    // Morgath & Pitbull (Assassino)
          [Role.MAGO]: 2,         // Loki, Mamma di Buck, Sguattero (Mago)
          [Role.SUPPORTO]: 3,
          [Role.TANK]: 4,         // Marcello, Romeo, Ruggine (Tank)
        }
        if (a.rarity === b.rarity) {
          return roleOrderMap[a.role] - roleOrderMap[b.role];
        }
        return rarityOrderMap[a.rarity] - rarityOrderMap[b.rarity];
      })
      .map(design => {
        const collectionEntry = collection[design.designKey];
        return {
          designKey: design.designKey,
          rarity: design.rarity,
          type: design.type,
          role: design.role, // Pass the role from design to slot
          ownedCard: collectionEntry?.card,
          copies: collectionEntry?.count,
        };
      });
    acc[type] = typeSlots;
    return acc;
  }, {} as Record<AnimalType, CardSlot[]>);

  // Apply filters to the structured album
  const filteredAlbum = Object.entries(structuredAlbum).reduce((acc, [type, slots]) => {
    if (typeFilter !== 'all' && type !== typeFilter) {
      return acc; // Skip types not matching filter
    }

    const filteredSlots = slots.map(slot => {
      // If rarity filter is active and the slot's rarity doesn't match,
      // or if there's an owned card but it doesn't match the rarity filter,
      // then we treat it as unowned for display purposes, showing a placeholder.
      if (rarityFilter !== 'all' && slot.rarity !== rarityFilter) {
        return { ...slot, ownedCard: undefined, copies: 0 }; // Force placeholder if rarity doesn't match filter
      }
      // If role filter is active and the slot's role doesn't match
      if (roleFilter !== 'all' && slot.role !== roleFilter) { // Apply filter to slot.role
        return { ...slot, ownedCard: undefined, copies: 0 }; // Force placeholder if role doesn't match filter
      }
      return slot;
    });
    acc[type as AnimalType] = filteredSlots;
    return acc;
  }, {} as Record<AnimalType, CardSlot[]>);
  
  // Count total unique cards collected
  const totalUniqueCardsCollected = Object.keys(collection).length;

  // Count cards actually displayed in the album (considering filters)
  const displayedCardCount = Object.values(filteredAlbum).flat().filter(slot => slot.ownedCard).length;


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#260e3a] to-[#130e3a] text-slate-100 selection:bg-indigo-500 font-inter">
      <nav className="sticky top-0 z-50 bg-[#260e3a]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setShowInfo(true)}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-all bg-white/5"
          >
            <span className="font-serif italic font-bold text-lg">!</span>
          </button>
          <h1 className="font-cinzel text-[10px] sm:text-md tracking-tight cursor-pointer" onClick={() => setView('home')}>
            GLI ANIMALI <span className="hidden xs:inline">RANDAGI</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setView('home')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${view === 'home' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              PACKS
            </button>
            <button 
              onClick={() => setView('collection')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${view === 'collection' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              ALBUM ({totalUniqueCardsCollected})
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-2 sm:px-3 py-1 rounded-full">
              {/* Coins display */}
              <div className="flex items-center gap-1 sm:gap-2 text-amber-400 font-bold text-[10px] sm:text-sm">
                <Coins size={12} className="sm:w-[14px]" />
                <span>{coins}</span>
              </div>
              <div className="w-[1px] h-3 bg-amber-400/30 rounded-full mx-1" /> {/* Separator */}
              {/* Timer display - always visible now */}
              <div className="flex items-center gap-1 text-[8px] sm:text-[10px] text-slate-500">
                <Clock size={8} className="sm:w-[10px]" />
                <span>+10 in {timeLeft}s</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Removed API key warning banner */}

      {storageError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
          <AlertTriangle size={14} />
          Memoria browser piena. I progressi potrebbero non salvarsi al riavvio.
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {view === 'home' && (
          <PackOpener 
            onCardsRevealed={addCardsToCollection} // Changed to addCardsToCollection
            coins={coins}
            onSpendCoins={handleSpendCoins}
          />
        )}

        {view === 'collection' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/5 pb-6 gap-4">
              <div>
                <h2 className="text-xl sm:text-4xl font-extrabold tracking-tight">Le Tue Carte</h2>
                <p className="hidden sm:flex text-slate-500 text-sm mt-2 items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  Hai collezionato {totalUniqueCardsCollected} animali unici.
                </p>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap"> {/* Added flex-wrap */}
                <div className="relative flex-1 sm:flex-none" ref={rarityRef}>
                  <button 
                    onClick={() => { setIsRarityFilterOpen(!isRarityFilterOpen); setIsTypeFilterOpen(false); setIsRoleFilterOpen(false); }}
                    className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all font-bold text-[10px] sm:text-xs ${isRarityFilterOpen ? 'bg-white text-slate-900 border-white' : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/30'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Filter size={12} />
                      <span className="truncate">{getRarityLabel(rarityFilter)}</span>
                    </div>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${isRarityFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isRarityFilterOpen && (
                    <div className="absolute left-0 sm:right-0 mt-2 w-44 sm:w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={() => { setRarityFilter('all'); setIsRarityFilterOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${rarityFilter === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                          Tutte le Rarità
                          {rarityFilter === 'all' && <Check size={12} />}
                        </button>
                        <div className="h-[1px] bg-white/5 mx-2 my-1" />
                        {Object.values(Rarity).map(r => (
                          <button 
                            key={r}
                            onClick={() => { setRarityFilter(r); setIsRarityFilterOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${rarityFilter === r ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                          >
                            <span className="capitalize">{r}</span>
                            {rarityFilter === r && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative flex-1 sm:flex-none" ref={typeRef}>
                  <button 
                    onClick={() => { setIsTypeFilterOpen(!isTypeFilterOpen); setIsRarityFilterOpen(false); setIsRoleFilterOpen(false); }}
                    className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all font-bold text-[10px] sm:text-xs ${isTypeFilterOpen ? 'bg-white text-slate-900 border-white' : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/30'}`}
                  >
                    <div className="flex items-center gap-2">
                      <MousePointer2 size={12} />
                      <span className="truncate">{getTypeLabel(typeFilter)}</span>
                    </div>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${isTypeFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isTypeFilterOpen && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={() => { setTypeFilter('all'); setIsTypeFilterOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${typeFilter === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                          Tutti i Tipi
                          {typeFilter === 'all' && <Check size={12} />}
                        </button>
                        <div className="h-[1px] bg-white/5 mx-2 my-1" />
                        {Object.values(AnimalType).map(t => (
                          <button 
                            key={t}
                            onClick={() => { setTypeFilter(t); setIsTypeFilterOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${typeFilter === t ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                          >
                            <span>{t}</span>
                            {typeFilter === t && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* New Role Filter */}
                <div className="relative flex-1 sm:flex-none" ref={roleRef}>
                  <button 
                    onClick={() => { setIsRoleFilterOpen(!isRoleFilterOpen); setIsRarityFilterOpen(false); setIsTypeFilterOpen(false); }}
                    className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all font-bold text-[10px] sm:text-xs ${isRoleFilterOpen ? 'bg-white text-slate-900 border-white' : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/30'}`}
                  >
                    <div className="flex items-center gap-2">
                      {getRoleIcon(roleFilter === 'all' ? Role.COMBATTENTE : roleFilter, 12)} {/* Use a default icon when 'all' */}
                      <span className="truncate">{getRoleLabel(roleFilter)}</span>
                    </div>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${isRoleFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isRoleFilterOpen && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={() => { setRoleFilter('all'); setIsRoleFilterOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${roleFilter === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                          Tutti i Ruoli
                          {roleFilter === 'all' && <Check size={12} />}
                        </button>
                        <div className="h-[1px] bg-white/5 mx-2 my-1" />
                        {Object.values(Role).map(r => (
                          <button 
                            key={r}
                            onClick={() => { setRoleFilter(r); setIsRoleFilterOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${roleFilter === r ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                          >
                            <span className="capitalize">{r}</span>
                            {roleFilter === r && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Check if filters result in no displayed cards (only applies if filters are active) */}
            {displayedCardCount === 0 && (typeFilter !== 'all' || rarityFilter !== 'all' || roleFilter !== 'all') ? (
              <div className="py-20 text-center">
                <p className="text-slate-500 font-medium">Nessuna corrispondenza per i filtri selezionati.</p>
                <button 
                  onClick={() => { setRarityFilter('all'); setTypeFilter('all'); setRoleFilter('all'); }}
                  className="mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Resetta filtri
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(filteredAlbum).map(([type, slots]) => (
                  <div key={type} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="flex items-center gap-3 text-xl font-cinzel text-slate-300 tracking-widest uppercase mb-6 pb-4 border-b border-white/5">
                      {getAnimalTypeIcon(type as AnimalType, 24)}
                      {type}
                      <span className="text-slate-600 text-sm font-inter ml-auto">
                        {slots.filter(s => s.ownedCard).length} / {ALL_ALBUM_SLOT_DESIGNS.filter(d => d.type === type).length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 place-items-center">
                      {slots.map((slot, index) => (
                        slot.ownedCard ? (
                          <CardComponent 
                            key={slot.designKey} 
                            card={slot.ownedCard} 
                            copies={slot.copies}
                            onSell={handleSellCard} 
                            onCardClick={handleCardClick} // Pass click handler
                          />
                        ) : (
                          <MissingCardPlaceholder 
                            key={slot.designKey} 
                            designKey={slot.designKey} // Pass designKey
                            rarity={slot.rarity} 
                            type={slot.type} 
                            role={slot.role} // Pass role to placeholder
                            onUnlock={handleUnlockCard}
                            canAffordUnlock={coins >= UNLOCK_COST}
                            isUnlocking={isUnlockingCardKey === slot.designKey}
                          />
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fullscreen Card Modal */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => { setSelectedCard(null); setSelectedCardCopies(undefined); }} // Close on backdrop click
        >
          {/* Added flex justify-center to ensure CardComponent is centered within its container */}
          <div className="relative w-full max-w-sm sm:max-w-md flex justify-center" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking on card */}
            <CardComponent card={selectedCard} copies={selectedCardCopies} />
          </div>
        </div>
      )}

      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#220a32] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#220a32]/50">
              <h3 className="font-cinzel text-lg tracking-widest uppercase">Probabilità Pack</h3>
              <button onClick={() => setShowInfo(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-4">Garantita 1 Rara o Superiore</p>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Contenuto Standard</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Comune', value: '80%', color: 'text-white' },
                    { label: 'Non Comune', value: '40%', color: 'text-green-400' },
                    { label: 'Rara', value: '20%', color: 'text-purple-400' },
                    { label: 'Super Rara', value: '5%', color: 'text-red-400' },
                    { label: 'Leggendaria', value: '1%', color: 'text-yellow-400' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-300">{row.label}</span>
                      <span className={`font-black ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-[#220a32]/50">
              <button 
                onClick={() => setShowInfo(false)}
                className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Ho Capito
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto py-8 text-center text-[10px] text-slate-700 uppercase tracking-[0.2em]">
        <Zap size={12} className="inline mr-2 opacity-20" />
        Zenith TCG Engine • {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;