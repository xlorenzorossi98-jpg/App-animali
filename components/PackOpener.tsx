
import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import CardComponent from './CardComponent';
import { generatePackContents, generatePackImage } from '../services/geminiService';
import { Sparkles, Loader2, ChevronLeft, ChevronRight, Coins, ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';

interface PackOpenerProps {
  onCardsRevealed: (cards: Card[]) => void;
  onBack: () => void;
  coins: number;
  onSpendCoins: (amount: number) => boolean;
}

const PACK_COST = 100;

const PackOpener: React.FC<PackOpenerProps> = ({ onCardsRevealed, coins, onSpendCoins }) => {
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'opening' | 'revealed'>('idle');
  const [openedCards, setOpenedCards] = useState<Card[]>([]);
  const [isGoldPack, setIsGoldPack] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [currentPackIndex, setCurrentPackIndex] = useState(0);
  
  const [packImageCache, setPackImageCache] = useState<Record<string, string>>({});

  const packs = [
    { 
      id: 'legendary-lokito', 
      name: 'Legendary Lokito', 
      theme: 'Un gatto bianco e nero in primo piano con occhi verdi, seguito da un esercito di squali, cani, zanzare e uccelli.',
      imagePrompt: "Professional TCG card pack cover. In the extreme foreground, a close-up of a charismatic black and white cat with piercing bright green eyes. In the background, a chaotic and epic army consisting of sharks, various dogs, giant mosquitoes, and flying birds. High-fantasy digital art, cinematic lighting, vibrant colors, epic composition. NO TEXT."
    },
    {
      id: 'legendary-romeo',
      name: 'Legendary Romeo',
      theme: 'Un gatto grigio e bianco molto ciccione seguito da un esercito di squali, cani, zanzare e uccelli.',
      imagePrompt: "Professional TCG card pack cover. In the foreground, a very fat and majestic grey and white cat sitting proudly. In the background, an epic gathering of animals: sharks, dogs, large mosquitoes, and birds. Cinematic high-fantasy style, vibrant lighting, rich colors. NO TEXT."
    },
    {
      id: 'legendary-buck',
      name: 'Legendary Buck',
      theme: 'Un gatto arancione saggio con un occhio solo seguito da un esercito di squali, cani, zanzare e uccelli.',
      imagePrompt: "Professional TCG card pack cover. In the foreground, a wise orange cat with one blind eye (scarred eye). In the background, a massive army of diverse animals including sharks, dogs, giant mosquitoes, and birds. Epic fantasy digital illustration, dramatic lighting, detailed environment. NO TEXT."
    }
  ];

  const fetchPackImage = async (index: number) => {
    const currentPack = packs[index];
    
    if (packImageCache[currentPack.id]) {
      setImageLoading(false);
      setError(null);
      return;
    }

    try {
      setImageLoading(true);
      setError(null);
      const url = await generatePackImage(currentPack.imagePrompt);
      if (url) {
        setPackImageCache(prev => ({ ...prev, [currentPack.id]: url }));
      } else {
        throw new Error("Empty URL returned from service");
      }
    } catch (err: any) {
      console.error("Errore generazione immagine pacchetto", err);
      setError("Impossibile caricare l'immagine del pacchetto.");
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    fetchPackImage(currentPackIndex);
  }, [currentPackIndex]);

  const nextPack = () => {
    if (loading || imageLoading) return;
    setCurrentPackIndex((prev) => (prev + 1) % packs.length);
  };

  const prevPack = () => {
    if (loading || imageLoading) return;
    setCurrentPackIndex((prev) => (prev - 1 + packs.length) % packs.length);
  };

  const openPack = async () => {
    if (coins < PACK_COST) return;
    
    setLoading(true);
    setError(null);
    const success = onSpendCoins(PACK_COST);
    
    if (!success) {
      setLoading(false);
      return;
    }

    try {
      const result = await generatePackContents(packs[currentPackIndex].theme, packs[currentPackIndex].id);
      if (result.cards && result.cards.length > 0) {
        setOpenedCards(result.cards);
        setIsGoldPack(result.isGold);
        setStep('opening');
        
        setTimeout(() => {
          setStep('revealed');
          setRevealIndex(0);
        }, 1500);
      } else {
        throw new Error("No cards generated");
      }

    } catch (error) {
      console.error("Errore nell'apertura del pacchetto", error);
      setError("Errore durante l'estrazione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (revealIndex < openedCards.length - 1) {
      setRevealIndex(prev => prev + 1);
    } else {
      const finalCards = [...openedCards];
      setOpenedCards([]);
      setRevealIndex(-1);
      setIsGoldPack(false);
      setStep('idle');
      onCardsRevealed(finalCards);
    }
  };

  const currentPackImageUrl = packImageCache[packs[currentPackIndex].id];

  if (step === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-8 animate-in fade-in duration-700">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-cinzel text-slate-400 tracking-widest uppercase mb-2">Seleziona Pacchetto</h2>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Garantita 1 Rara o Superiore</p>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-12 mb-12">
          <button 
            onClick={prevPack}
            disabled={loading || imageLoading}
            className="p-3 text-slate-700 hover:text-white transition-colors bg-slate-900/50 rounded-full border border-white/5 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={32} />
          </button>
          
          <div className="relative group perspective-1000">
            <div className={`absolute -inset-6 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700 ${(imageLoading || loading) ? 'animate-pulse' : ''}`} />
            
            <div className="relative w-64 h-[400px] rounded-xl shadow-2xl overflow-hidden border-2 border-white/10 group-hover:scale-105 transition-transform duration-500 animate-float bg-slate-900 flex items-center justify-center">
               {imageLoading ? (
                 <div className="flex flex-col items-center gap-3 p-4 text-center">
                   <Loader2 className="animate-spin text-slate-500" size={32} />
                   <p className="text-slate-600 text-[8px] font-black uppercase tracking-widest">Generazione artistica...</p>
                 </div>
               ) : error ? (
                 <div className="flex flex-col items-center gap-3 p-6 text-center">
                   <AlertCircle className="text-red-500" size={32} />
                   <p className="text-slate-400 text-[10px] font-bold uppercase">{error}</p>
                   <button 
                    onClick={() => fetchPackImage(currentPackIndex)}
                    className="mt-2 flex items-center gap-2 text-white bg-white/10 px-3 py-2 rounded-lg text-[10px] hover:bg-white/20 transition-colors"
                   >
                     <RefreshCw size={12} /> Riprova
                   </button>
                 </div>
               ) : currentPackImageUrl ? (
                 <img 
                   src={currentPackImageUrl} 
                   alt={packs[currentPackIndex].name} 
                   className="w-full h-full object-cover animate-in fade-in duration-500"
                   onError={() => setError("Errore di caricamento immagine.")}
                 />
               ) : (
                 <div className="flex flex-col items-center gap-3">
                   <ImageIcon className="text-slate-700" size={32} />
                 </div>
               )}
               
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-12">
                 <h3 className="font-cinzel text-lg text-white text-center leading-tight mb-2 uppercase tracking-tighter drop-shadow-lg">{packs[currentPackIndex].name}</h3>
                 <div className="flex items-center justify-center gap-2 text-amber-400 font-black">
                   <Coins size={16} />
                   <span>{PACK_COST}</span>
                 </div>
               </div>

               {loading && (
                 <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-md z-20">
                   <div className="flex flex-col items-center gap-4">
                     <Loader2 className="animate-spin text-green-400" size={40} />
                     <p className="text-green-400 text-[10px] font-black tracking-[0.3em] animate-pulse">ESTRAZIONE...</p>
                   </div>
                 </div>
               )}
            </div>
          </div>

          <button 
            onClick={nextPack}
            disabled={loading || imageLoading}
            className="p-3 text-slate-700 hover:text-white transition-colors bg-slate-900/50 rounded-full border border-white/5 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight size={32} />
          </button>
        </div>
        
        <div className="w-64 space-y-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
            Pacchetto {currentPackIndex + 1} di {packs.length}
          </p>
          <button 
            disabled={loading || imageLoading || !!error || coins < PACK_COST}
            onClick={openPack}
            className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-tighter flex items-center justify-center gap-3 text-lg"
          >
            {loading ? 'Attendere...' : (coins < PACK_COST ? 'Insufficienti' : <><Sparkles size={20} /> Apri Ora</>)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-4 relative overflow-hidden">
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] animate-pulse pointer-events-none transition-colors duration-1000 ${isGoldPack ? 'bg-amber-500/20' : 'bg-green-500/10'}`} />

      {openedCards[revealIndex] && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="mb-6 text-slate-500 text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-4">
             Carta {revealIndex + 1} / {openedCards.length}
          </div>
          <CardComponent card={openedCards[revealIndex]} isNew={true} />
          <button 
            onClick={nextCard}
            className={`mt-12 px-16 py-4 font-black rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group shadow-xl ${isGoldPack ? 'bg-amber-500 text-black hover:shadow-amber-500/30' : 'bg-green-500 text-white hover:shadow-green-500/30'}`}
          >
            {revealIndex === openedCards.length - 1 ? 'Salva nell\'Album' : 'Prossima Carta'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PackOpener;
