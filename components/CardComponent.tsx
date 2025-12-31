import React from 'react';
import { Card, Rarity, AnimalType, Role } from '../types';
import RarityBadge from './RarityBadge';
import { Sword, Shield, Heart, Cat, Dog, Bird, Bug, Mouse, Fish, Turtle, Coins, Zap, ScrollText, Image } from 'lucide-react';

interface CardProps {
  card: Card;
  copies?: number; // New prop for displaying copy count
  onSell?: (designKey: string) => void; // onSell now takes designKey
  onCardClick?: (card: Card, copies?: number) => void; // New prop for click handler
}

const SELL_PRICES = {
  [Rarity.COMUNE]: 1,
  [Rarity.NON_COMUNE]: 5,
  [Rarity.RARA]: 10,
  [Rarity.SUPER_RARA]: 30,
  [Rarity.LEGGENDARIA]: 50
};

const CardComponent: React.FC<CardProps> = ({ card, copies, onSell, onCardClick }) => {
  const getTypeIcon = (type: AnimalType) => {
    switch (type) {
      case AnimalType.FELINO: return <Cat className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
      case AnimalType.CANE: return <Dog className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
      case AnimalType.VOLATILE: return <Bird className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
      case AnimalType.INSETTO: return <Bug className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
      case AnimalType.RODITORE: return <Mouse className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
      case AnimalType.PESCE: return <Fish className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
      case AnimalType.RETTILE: return <Turtle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
      default: return null;
    }
  };

  const getRoleIcon = (role: Role) => {
    const size = 'w-3 h-3 sm:w-3.5 sm:h-3.5'; // Adjusted for tablet
    switch (role) {
      case Role.ASSASSINO: return <Sword className={`${size} text-red-400`} />;
      case Role.TANK: return <Shield className={`${size} text-blue-400`} />;
      case Role.MAGO: return <Zap className={`${size} text-purple-400`} />;
      case Role.COMBATTENTE: return <Sword className={`${size} text-orange-400`} />;
      case Role.SUPPORTO: return <Heart className={`${size} text-green-400`} />;
      default: return null;
    }
  };

  const getThemeColors = () => {
    switch (card.type) {
      case AnimalType.FELINO: return 'from-red-600 to-red-800';
      case AnimalType.CANE: return 'from-orange-500 to-orange-700';
      case AnimalType.VOLATILE: return 'from-sky-400 to-sky-600';
      case AnimalType.INSETTO: return 'from-green-600 to-green-800';
      case AnimalType.RODITORE: return 'from-amber-900 to-[#3e2723]';
      case AnimalType.PESCE: return 'from-blue-600 to-blue-900';
      case AnimalType.RETTILE: return 'from-lime-400 to-lime-600';
      default: return 'from-slate-700 to-slate-900';
    }
  };

  const getBorderColor = () => {
    switch (card.rarity) {
      case Rarity.COMUNE: return 'bg-slate-400';
      case Rarity.NON_COMUNE: return 'bg-green-500';
      case Rarity.RARA: return 'bg-purple-500';
      case Rarity.SUPER_RARA: return 'bg-red-500';
      case Rarity.LEGGENDARIA: return 'bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.4)] sm:shadow-[0_0_20px_rgba(250,204,21,0.4)]';
      default: return 'bg-slate-800';
    }
  };

  const sellPrice = SELL_PRICES[card.rarity] || 0;

  return (
    <div 
      className={`relative w-full aspect-[2/3.3] max-w-[256px] rounded-lg sm:rounded-2xl p-[1.5px] sm:p-[3px] group transition-all duration-500 hover:scale-105 active:scale-95 ${onCardClick ? 'cursor-pointer' : ''} ${getBorderColor()}`}
      onClick={() => onCardClick && onCardClick(card, copies)}
    >
      <div className={`w-full h-full rounded-[6px] sm:rounded-[14px] overflow-hidden bg-[#220a32] flex flex-col`}>
        
        {/* Section 1: Header (Title / Type Icon) */}
        <div className={`h-8 sm:h-14 bg-gradient-to-r ${getThemeColors()} px-2 sm:px-4 flex items-center justify-between shadow-inner shrink-0`}>
          <h3 className="font-cinzel text-[8px] sm:text-[14px] truncate max-w-[75%] text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.6)] font-black uppercase tracking-tight">
            {card.name}
          </h3>
          <div className="text-white drop-shadow-md bg-black/30 p-1 sm:p-1.5 rounded-full shrink-0 border border-white/10">
            {getTypeIcon(card.type)}
          </div>
        </div>

        {/* Section 2: Image Area */}
        <div className="relative h-[35%] sm:h-[33%] overflow-hidden bg-slate-800 flex items-center justify-center p-2 sm:p-4 shrink-0 border-y border-white/5">
          {/* Reverting to placeholder as image generation is removed */}
          <div className="flex flex-col items-center justify-center h-full w-full">
            <Image className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600" />
            <span className="text-[6.5px] sm:text-[11px] text-slate-400 italic mt-1">Immagine non disponibile</span>
          </div>
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 scale-[0.55] sm:scale-100 origin-top-right">
            <RarityBadge rarity={card.rarity} />
          </div>
        </div>

        {/* Section 3: Description Area (Now fully scrollable) */}
        <div className="flex-1 p-1.5 sm:p-2.5 flex flex-col bg-gradient-to-b from-[#2d1142] to-[#220a32] relative min-h-[50px]"> {/* min-h for small screens */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar"> {/* Custom scrollbar for better aesthetics */}
            <p className="text-[6.5px] sm:text-[11px] text-slate-300 italic leading-tight opacity-80">
              "{card.description}"
            </p>
          </div>
          
          {/* Sell button and copies badge remain in absolute/relative positioning */}
          {onSell && (
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent onCardClick when selling
                onSell(card.designKey); // Pass designKey for selling
              }}
              className="absolute -top-4 right-1 bg-red-600 hover:bg-red-500 text-white p-1 sm:p-2 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-90 border border-white/20 flex items-center gap-1 group/sell"
              title={`Vendi per ${sellPrice} monete`}
            >
              <Coins className="w-2 h-2 sm:w-4 sm:h-4" />
              <span className="text-[6px] sm:text-[10px] font-black">{sellPrice}</span>
            </button>
          )}

          {copies && copies > 1 && (
            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-white/10 text-white text-[8px] sm:text-[12px] font-black px-2 py-0.5 rounded-full backdrop-blur-sm">
              x{copies}
            </div>
          )}
        </div>
        
        {/* Section 4: Stats Area */}
        <div className="grid grid-cols-3 gap-1 sm:gap-1 p-1.5 sm:p-2.5 pt-1.5 sm:pt-3 border-t border-white/10 bg-gradient-to-b from-[#2d1142] to-[#220a32]">
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 bg-red-950/40 rounded sm:rounded-xl py-0.5 sm:py-1 border border-red-900/30">
              <Heart className="w-2 h-2 sm:w-4 sm:h-4 text-[#ff1a1a] drop-shadow-[0_0_5px_rgba(255,26,26,0.3)]" />
              <span className="text-[8px] sm:text-xs font-black text-white">{card.hp}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 bg-orange-950/40 rounded sm:rounded-xl py-0.5 sm:py-1 border border-orange-900/30">
              <Sword className="w-2 h-2 sm:w-4 sm:h-4 text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.3)]" />
              <span className="text-[8px] sm:text-xs font-black text-white">{card.attack}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 bg-blue-950/40 rounded sm:rounded-xl py-0.5 sm:py-1 border border-blue-900/30">
              <Shield className="w-2 h-2 sm:w-4 sm:h-4 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.3)]" />
              <span className="text-[8px] sm:text-xs font-black text-white">{card.defense}</span>
            </div>
        </div>

        {/* Section 5: Role Display */}
        <div className="p-1.5 sm:p-2.5 bg-gradient-to-b from-[#2d1142] to-[#220a32] relative w-full flex items-center justify-center gap-1 border-t border-white/10">
            {getRoleIcon(card.role)}
            <span className="text-[7px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
              {card.role}
            </span>
        </div>
      </div>
      
      {card.rarity !== Rarity.COMUNE && (
        <div className="absolute -inset-0.5 bg-white/5 rounded-lg sm:rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
      )}
    </div>
  );
};

export default CardComponent;