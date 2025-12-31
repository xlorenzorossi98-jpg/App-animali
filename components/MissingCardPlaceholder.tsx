import React from 'react';
import { Rarity, AnimalType, Role } from '../types';
import { HelpCircle, Cat, Dog, Bird, Bug, Mouse, Fish, Turtle, Coins, Loader2, Sword, Shield, Heart, Zap, ScrollText } from 'lucide-react'; // Removed KeyRound

interface MissingCardPlaceholderProps {
  designKey: string; // New: pass the designKey of the slot
  rarity: Rarity;
  type: AnimalType;
  role: Role; // New: pass the role for the slot
  onUnlock: (designKey: string) => void; // onUnlock now takes designKey
  canAffordUnlock: boolean;
  isUnlocking: boolean;
}

const UNLOCK_COST = 500;

const MissingCardPlaceholder: React.FC<MissingCardPlaceholderProps> = ({ designKey, rarity, type, role, onUnlock, canAffordUnlock, isUnlocking }) => {
  const getBorderColor = () => {
    switch (rarity) {
      case Rarity.COMUNE: return 'bg-slate-400';
      case Rarity.NON_COMUNE: return 'bg-green-500';
      case Rarity.RARA: return 'bg-purple-500';
      case Rarity.SUPER_RARA: return 'bg-red-500';
      case Rarity.LEGGENDARIA: return 'bg-yellow-400 animate-pulse';
      default: return 'bg-slate-800';
    }
  };

  const getTypeIcon = (animalType: AnimalType) => {
    switch (animalType) {
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
    const size = 'w-3.5 h-3.5 sm:w-3.5 sm:h-3.5'; // Adjusted for tablet
    switch (role) {
      case Role.ASSASSINO: return <Sword className={`${size} text-slate-700/50`} />;
      case Role.TANK: return <Shield className={`${size} text-slate-700/50`} />;
      case Role.MAGO: return <Zap className={`${size} text-slate-700/50`} />;
      case Role.COMBATTENTE: return <Sword className={`${size} text-slate-700/50`} />;
      case Role.SUPPORTO: return <Heart className={`${size} text-slate-700/50`} />;
      default: return null;
    }
  };

  const isUnlockDisabled = !canAffordUnlock || isUnlocking; // Removed hasApiKeySelected from this condition

  return (
    <div className={`relative w-full aspect-[2/3.3] max-w-[256px] rounded-lg sm:rounded-2xl p-[1.5px] sm:p-[3px] group ${getBorderColor()} opacity-60 grayscale-[70%]`}>
      <div className={`w-full h-full rounded-[6px] sm:rounded-[14px] overflow-hidden bg-[#220a32] flex flex-col`}>
        
        {/* Section 1: Header (Title / Type Icon) */}
        <div className={`h-8 sm:h-14 bg-slate-800/50 px-2 sm:px-4 flex items-center justify-between shadow-inner shrink-0 w-full`}>
          <h3 className="font-cinzel text-[8px] sm:text-[14px] truncate max-w-[75%] text-slate-500 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.6)] font-black uppercase tracking-tight">
            Slot {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </h3>
          <div className="text-slate-500 drop-shadow-md bg-black/30 p-1 sm:p-1.5 rounded-full shrink-0 border border-white/10">
            {getTypeIcon(type)}
          </div>
        </div>

        {/* Section 2: Image Area (Placeholder) */}
        <div className="relative h-[35%] sm:h-[33%] overflow-hidden bg-slate-800/70 flex items-center justify-center p-2 sm:p-4 shrink-0 border-y border-white/5">
          <HelpCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600" />
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 scale-[0.55] sm:scale-100 origin-top-right">
            <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-tighter bg-slate-500 text-white font-bold">
              {rarity}
            </span>
          </div>
        </div>

        {/* Section 3: Description Area (Placeholder for full text) */}
        <div className="flex-1 p-1.5 sm:p-2.5 flex flex-col justify-center items-center bg-gradient-to-b from-[#2d1142] to-[#220a32] relative border-b border-white/5 min-h-[50px]">
          <ScrollText className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700/50" />
          <span className="text-[7px] sm:text-[10px] text-slate-700/70 uppercase font-bold tracking-wider mt-1">Descrizione</span>
        </div>
        
        {/* Section 4: Stats Area (Placeholder) */}
        <div className="grid grid-cols-3 gap-1 sm:gap-1 p-1.5 sm:p-2.5 pt-1.5 sm:pt-3 border-t border-white/10 bg-gradient-to-b from-[#2d1142] to-[#220a32]">
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 bg-red-950/20 rounded sm:rounded-xl py-0.5 sm:py-1 border border-red-900/10">
              <Heart className="w-2 h-2 sm:w-4 sm:h-4 text-slate-700/50" />
              <span className="text-[8px] sm:text-xs font-black text-slate-700">HP</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 bg-orange-950/20 rounded sm:rounded-xl py-0.5 sm:py-1 border border-orange-900/10">
              <Sword className="w-2 h-2 sm:w-4 sm:h-4 text-slate-700/50" />
              <span className="text-[8px] sm:text-xs font-black text-slate-700">ATK</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 bg-blue-950/20 rounded sm:rounded-xl py-0.5 sm:py-1 border border-blue-900/10">
              <Shield className="w-2 h-2 sm:w-4 sm:h-4 text-slate-700/50" />
              <span className="text-[8px] sm:text-xs font-black text-slate-700">DEF</span>
            </div>
        </div>

        {/* Section 5: Role Area + Unlock Button */}
        <div className="p-1.5 sm:p-2.5 bg-gradient-to-b from-[#2d1142] to-[#220a32] relative w-full flex flex-col items-center justify-center border-t border-white/10">
            <div className="text-center flex items-center justify-center gap-1 mb-2"> 
                {getRoleIcon(role)}
                <span className="text-[7px] sm:text-[10px] font-bold text-