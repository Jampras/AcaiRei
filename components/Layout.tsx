
import React, { useRef } from 'react';
import { ShoppingCart, Clock, Star, Flame, Settings, Power, LogOut } from 'lucide-react';
import { CartItem, Category } from '../types';
import { CATEGORIES } from '../constants';

// --- Header ---
interface HeaderProps {
  cartCount: number;
  openCart: () => void;
  cartPulse: boolean;
  isAdmin: boolean;
  onAdminHold: () => void;
  onAdminHoldEnd: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  cartCount, openCart, cartPulse, isAdmin, onAdminHold, onAdminHoldEnd, onLogout 
}) => {
  return (
    <>
      {isAdmin && (
        <button 
          onClick={onLogout}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 border-2 border-white animate-bounce"
        >
          <LogOut size={14} /> Sair da Gestão
        </button>
      )}

      <header className="bg-purple-900 text-white rounded-b-[4rem] px-6 pt-10 pb-14 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 blur-[100px] -mr-40 -mt-40 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 blur-[80px] -ml-32 -mb-32 rounded-full"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h1 
              onPointerDown={onAdminHold}
              onPointerUp={onAdminHoldEnd}
              onPointerLeave={onAdminHoldEnd}
              className="text-4xl font-display italic tracking-tight flex items-center gap-2 cursor-default select-none active:scale-95 transition-transform"
            >
              Açaí Real
              {isAdmin && <span className="bg-yellow-400 text-purple-950 text-[10px] px-2.5 py-1 rounded-full not-italic font-black shadow-lg animate-pulse">MODO GESTÃO</span>}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200">Preparo em 15 min</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={openCart}
              className={`relative p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 transition-all active:scale-90 hover:bg-white/20 ${cartPulse ? 'scale-110 bg-purple-500/30' : ''}`}
            >
              <ShoppingCart size={24} className={cartPulse ? 'text-yellow-400' : ''} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-purple-950 font-black text-[11px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-purple-900 animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="relative z-10 px-2">
          <h2 className="text-3xl font-black leading-tight mb-2">
            Escolha seu <br/> <span className="text-yellow-400 italic">Momento Real</span> 💜
          </h2>
          <p className="text-purple-200 text-sm font-medium opacity-80 mb-6">Monte do seu jeito e receba em casa.</p>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
              <Clock size={14} className="text-yellow-400" /> Rápido
            </div>
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
              <Star size={14} className="text-yellow-400 fill-yellow-400" /> Top 1
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

// --- Category Filter ---
interface CategoryFilterProps {
  activeCategory: Category | 'All';
  setActiveCategory: (cat: Category | 'All') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="px-6 sticky top-4 z-40 mt-2">
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-2 shadow-xl border border-purple-50 flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveCategory('All')} className={`flex-shrink-0 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeCategory === 'All' ? 'bg-purple-900 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400'}`}>Todos</button>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id as Category)} className={`flex-shrink-0 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${activeCategory === cat.id ? 'bg-purple-900 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400'}`}><span>{cat.icon}</span> {cat.label}</button>
        ))}
      </div>
    </div>
  );
};

// --- Bottom Nav ---
interface BottomNavProps {
  setActiveCategory: (cat: Category | 'All') => void;
  openCart: () => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ setActiveCategory, openCart, cartCount }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-purple-50 px-10 py-6 flex justify-around items-center z-40 rounded-t-[3.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <button onClick={() => { setActiveCategory('All'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-purple-900 flex flex-col items-center gap-1 active:scale-90 transition-transform">
        <Flame size={24} className="fill-purple-900" />
        <span className="text-[9px] font-black uppercase tracking-widest">Cardápio</span>
      </button>
      <button onClick={openCart} className="text-gray-400 flex flex-col items-center gap-1 active:scale-90 transition-transform relative">
        <ShoppingCart size={24} />
        {cartCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></span>}
        <span className="text-[9px] font-black uppercase tracking-widest">Sacola</span>
      </button>
    </nav>
  );
};
