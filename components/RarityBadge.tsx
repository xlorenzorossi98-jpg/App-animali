
import React from 'react';
import { Rarity } from '../types';

const RarityBadge: React.FC<{ rarity: Rarity }> = ({ rarity }) => {
  const getStyles = () => {
    switch (rarity) {
      case Rarity.COMUNE: return 'bg-white text-black font-bold';
      case Rarity.NON_COMUNE: return 'bg-green-500 text-white font-bold';
      case Rarity.RARA: return 'bg-purple-500 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)]';
      case Rarity.SUPER_RARA: return 'bg-red-500 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.6)]';
      case Rarity.LEGGENDARIA: return 'bg-yellow-400 text-black font-black animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.8)]';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-tighter ${getStyles()}`}>
      {rarity}
    </span>
  );
};

export default RarityBadge;