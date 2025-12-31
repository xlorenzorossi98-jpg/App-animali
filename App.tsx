
import React, { useState, useEffect, useRef } from 'react';
import { Card, AppView, Rarity, AnimalType } from './types';
import PackOpener from './components/PackOpener';
import CardComponent from './components/CardComponent';
import { Zap, Coins, Clock, X, Filter, ChevronDown, Check, MousePointer2, AlertTriangle } from 'lucide-react';

const SELL_PRICES = {
  [Rarity.COMUNE]: 1,
  [Rarity.NON_COMUNE]: 5,
  [Rarity.RARA]: 10,
  [Rarity.SUPER_RARA]: 30,
  [Rarity.LEGGENDARIA]: 50
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [collection, setCollection] = useState<Card[]>([]);
  const [coins, setCoins] = useState(1000);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showInfo, setShowInfo] = useState(false);
  const [storageError, setStorageError] = useState(false);
  
  // Filtri
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AnimalType | 'all'>('all');
  const [isRarityFilterOpen, setIsRarityFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  
  const rarityRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Caricamento dati iniziale
  useEffect(() => {
    try {
      const savedCol = localStorage.getItem('zenith_collection');
      const savedCoins = localStorage.getItem('zenith_coins');
      if (savedCol) setCollection(JSON.parse(savedCol));
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
    if (collection.length === 0) return;
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

  const saveCards = (newCards: Card[]) => {
    setCollection(prev => [...newCards, ...prev]);
  };

  const handleSpendCoins = (amount: number) => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      return true;
    }
    return false;
  };

  const handleSellCard = (cardId: string) => {
    const cardToSell = collection.find(c => c.id === cardId);
    if (!cardToSell) return;

    const price = SELL_PRICES[cardToSell.rarity] || 0;
    setCoins(prev => prev + price);
    setCollection(prev => prev.filter(c => c.id !== cardId));
  };

  const filteredCollection = collection.filter(card => {
    const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter;
    const matchesType = typeFilter === 'all' || card.type === typeFilter;
    return matchesRarity && matchesType;
  });

  const getRarityLabel = (r: Rarity | 'all') => r === 'all' ? 'Rarità' : r.charAt(0).toUpperCase() + r.slice(1);
  const getTypeLabel = (t: AnimalType | 'all') => t === 'all' ? 'Tipo' : t;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500 font-inter">
      <nav className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3 flex justify-between items-center">
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
              ALBUM ({collection.length})
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 sm:gap-2 bg-amber-500/10 border border-amber-500/20 px-2 sm:px-3 py-1 rounded-full text-amber-400 font-bold text-[10px] sm:text-sm">
                <Coins size={12} className="sm:w-[14px]" />
                <span>{coins}</span>
              </div>
              <div className="hidden xs:flex items-center gap-1 text-[8px] sm:text-[10px] text-slate-500 mt-0.5">
                <Clock size={8} className="sm:w-[10px]" />
                <span>+10 in {timeLeft}s</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {storageError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
          <AlertTriangle size={14} />
          Memoria browser piena. I progressi potrebbero non salvarsi al riavvio.
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {view === 'home' && (
          <PackOpener 
            onCardsRevealed={saveCards} 
            onBack={() => {}} 
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
                  Hai collezionato {collection.length} animali unici.
                </p>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none" ref={rarityRef}>
                  <button 
                    onClick={() => { setIsRarityFilterOpen(!isRarityFilterOpen); setIsTypeFilterOpen(false); }}
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
                    onClick={() => { setIsTypeFilterOpen(!isTypeFilterOpen); setIsRarityFilterOpen(false); }}
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
              </div>
            </header>

            {collection.length === 0 ? (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 border border-white/5 mb-4">
                   <Zap className="text-slate-700" size={32} />
                </div>
                <p className="text-slate-500 font-medium">Non hai ancora nessuna carta.</p>
              </div>
            ) : filteredCollection.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-slate-500 font-medium">Nessuna corrispondenza per i filtri selezionati.</p>
                <button 
                  onClick={() => { setRarityFilter('all'); setTypeFilter('all'); }}
                  className="mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Resetta filtri
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-6 md:gap-8 place-items-center">
                {filteredCollection.map(card => (
                  <CardComponent key={card.id} card={card} onSell={handleSellCard} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-cinzel text-lg tracking-widest uppercase">Probabilità Pack</h3>
              <button onClick={() => setShowInfo(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Contenuto Standard</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Comune', value: '50%', color: 'text-white' },
                    { label: 'Non Comune', value: '35%', color: 'text-green-400' },
                    { label: 'Rara', value: '20%', color: 'text-purple-400' },
                    { label: 'Super Rara', value: '10%', color: 'text-red-400' },
                    { label: 'Leggendaria', value: '5%', color: 'text-yellow-400' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-300">{row.label}</span>
                      <span className={`font-black ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-800/50">
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
