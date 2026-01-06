
import React, { useState } from 'react';
import { Sparkles, Check, Plus, Flame, Eye, Edit3, ChevronLeft, X, Star, Minus } from 'lucide-react';
import { Product, CartItem } from '../types';

// --- Popular Products Carousel ---
interface PopularCarouselProps {
  products: Product[];
  onSelect: (p: Product) => void;
  onQuickAdd: (e: React.MouseEvent, p: Product) => void;
  clickedId: string | null;
}

export const PopularCarousel: React.FC<PopularCarouselProps> = ({ products, onSelect, onQuickAdd, clickedId }) => {
  if (products.length === 0) return null;

  return (
    <section className="mt-8 animate-fade-slide-up">
      <div className="px-6 mb-4 flex items-center justify-between">
        <h3 className="text-xl font-black text-purple-950 flex items-center gap-2">
          <Sparkles className="text-yellow-500" size={20} /> Os Queridinhos
        </h3>
      </div>
      <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 px-6" style={{ scrollPaddingLeft: '1.5rem' }}>
        {products.map((product, idx) => (
          <div 
            key={`pop-${product.id}-${idx}`} 
            className="flex-shrink-0 w-[72vw] max-w-[280px] snap-start bg-purple-50 rounded-[3rem] p-4 border border-purple-100/50 group active:scale-[0.98] transition-all relative overflow-hidden"
          >
            <div onClick={() => onSelect(product)} className="cursor-pointer">
              <div className="relative h-44 w-full rounded-[2.5rem] overflow-hidden mb-4 shadow-xl">
                <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent"></div>
                {product.tag && <span className="absolute top-3 left-3 bg-yellow-400 text-purple-950 text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase">{product.tag}</span>}
              </div>
              <h4 className="font-black text-purple-950 text-base leading-tight mb-1 line-clamp-1">{product.name}</h4>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-black text-purple-700">R$ {product.price.toFixed(2)}</span>
              <button 
                onClick={(e) => onQuickAdd(e, product)}
                className={`p-3 rounded-2xl shadow-lg transition-all active:scale-90 ${clickedId === product.id ? 'bg-green-500 text-white' : 'bg-purple-900 text-white'}`}
              >
                {clickedId === product.id ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- Product List Item ---
interface ProductItemProps {
  product: Product;
  isAdmin: boolean;
  onSelect: (p: Product) => void;
  onQuickAdd: (e: React.MouseEvent, p: Product) => void;
  onEdit: (p: Product) => void;
  onToggleStock: (id: string) => void;
  onAddCopy: (e: React.MouseEvent) => void;
  clickedId: string | null;
  delayIndex: number;
}

// Memoized for performance in long lists
export const ProductItem = React.memo<ProductItemProps>(({ 
  product, isAdmin, onSelect, onQuickAdd, onEdit, onToggleStock, onAddCopy, clickedId, delayIndex 
}) => {
  return (
    <div 
      className={`bg-white rounded-[2.5rem] p-4 border border-purple-50 flex items-center gap-4 group transition-all active:scale-[0.98] animate-fade-slide-up opacity-0 shadow-sm hover:shadow-md ${product.inStock === false && !isAdmin ? 'grayscale opacity-60' : ''}`} 
      style={{ animationDelay: `${delayIndex * 0.05}s`, animationFillMode: 'forwards' }}
    >
      <div onClick={() => { if(!isAdmin && product.inStock) onSelect(product); }} className="flex-1 flex items-center gap-4 cursor-pointer">
        <div className="relative w-24 h-24 flex-shrink-0 bg-purple-100 rounded-[2rem] overflow-hidden shadow-inner">
          <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          {product.inStock === false && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[8px] text-white font-black uppercase rotate-12">Esgotado</div>}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-purple-950 text-[15px] leading-tight line-clamp-1">{product.name}</h4>
            {product.popular && <Flame className="text-orange-500" size={14} />}
          </div>
          <p className="text-gray-400 text-[10px] line-clamp-2 leading-relaxed mb-3">{product.description}</p>
          <span className="text-purple-700 font-black text-base">R$ {product.price.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {isAdmin ? (
          <>
            <button onClick={() => onToggleStock(product.id)} className={`p-2 rounded-xl ${product.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`} title="Ocultar/Exibir"><Eye size={16} /></button>
            <button onClick={() => onEdit(product)} className="p-2 bg-blue-100 text-blue-600 rounded-xl" title="Editar"><Edit3 size={16} /></button>
            <button onClick={onAddCopy} className="p-2 bg-purple-100 text-purple-600 rounded-xl" title="Adicionar Novo"><Plus size={16} /></button>
          </>
        ) : (
          <button 
            onClick={(e) => onQuickAdd(e, product)}
            className={`p-3 rounded-2xl shadow-lg transition-all active:scale-90 ${clickedId === product.id ? 'bg-green-500 text-white' : 'bg-purple-900 text-white'}`}
          >
            {clickedId === product.id ? <Check size={18} /> : <Plus size={18} />}
          </button>
        )}
      </div>
    </div>
  );
});

// --- Product Modal (Details) ---
const EXTRAS = [
  { id: 'extra-nutella', name: 'Nutella Original', price: 5.00 },
  { id: 'extra-ninho', name: 'Leite Ninho', price: 3.50 },
  { id: 'extra-morango', name: 'Morangos Frescos', price: 4.00 },
  { id: 'extra-pacoca', name: 'Paçoca Crocante', price: 2.50 },
];

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const toggleExtra = (extraName: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraName) ? prev.filter(e => e !== extraName) : [...prev, extraName]
    );
  };

  const calculateTotal = () => {
    const extrasPrice = selectedExtras.reduce((acc, extraName) => {
      const extra = EXTRAS.find(e => e.name === extraName);
      return acc + (extra?.price || 0);
    }, 0);
    return (product.price + extrasPrice) * Math.floor(quantity);
  };

  const handleConfirm = () => {
    const extrasPrice = selectedExtras.reduce((acc, extraName) => {
      const extra = EXTRAS.find(e => e.name === extraName);
      return acc + (extra?.price || 0);
    }, 0);

    const customizedItem: CartItem = {
      ...product,
      name: selectedExtras.length > 0 ? `${product.name} (+${selectedExtras.join(', ')})` : product.name,
      price: product.price + extrasPrice,
      quantity: Math.floor(quantity)
    };
    onAddToCart(customizedItem);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-purple-950/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white rounded-t-[4rem] h-[94vh] overflow-y-auto animate-slide-up-full shadow-2xl">
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
          <button onClick={onClose} className="flex items-center gap-2 px-5 py-3 bg-white/95 backdrop-blur-md rounded-2xl text-purple-950 border border-purple-100 shadow-xl active:scale-90 transition-all font-black text-[10px] uppercase tracking-wider">
            <ChevronLeft size={18} className="text-purple-600" /> Ver Cardápio
          </button>
          <button onClick={onClose} className="p-3 bg-white/95 rounded-2xl text-gray-400 shadow-lg"><X size={20} /></button>
        </div>
        
        <img src={product.image} className="h-[45vh] w-full object-cover" loading="lazy" />
        <div className="px-8 -mt-20 relative z-10 pb-16">
          <div className="bg-white rounded-[3.5rem] p-8 shadow-2xl border border-purple-50">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-3xl font-black text-purple-950 leading-tight">{product.name}</h2>
              <div className="bg-yellow-50 px-4 py-2 rounded-2xl text-yellow-600 font-black text-xs flex items-center gap-1.5 shadow-sm">
                <Star size={16} className="fill-yellow-500 text-yellow-500" /> 5.0
              </div>
            </div>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">{product.description}</p>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px bg-purple-100 flex-1"></div>
              <h4 className="text-[10px] font-black uppercase text-purple-300 tracking-[0.2em]">Melhorar meu Açaí</h4>
              <div className="h-px bg-purple-100 flex-1"></div>
            </div>

            <div className="space-y-3 mb-10">
              {EXTRAS.map(extra => (
                <button key={extra.id} onClick={() => toggleExtra(extra.name)} className={`w-full flex justify-between items-center p-5 rounded-[2rem] border-2 transition-all duration-300 ${selectedExtras.includes(extra.name) ? 'border-purple-600 bg-purple-50 shadow-xl scale-[1.01]' : 'border-gray-50 bg-gray-50'}`}>
                  <div className="flex gap-4 items-center">
                    <div className={`w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center ${selectedExtras.includes(extra.name) ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}>
                      {selectedExtras.includes(extra.name) && <Check size={16} className="text-white" />}
                    </div>
                    <span className={`font-black text-sm ${selectedExtras.includes(extra.name) ? 'text-purple-900' : 'text-gray-500'}`}>{extra.name}</span>
                  </div>
                  <span className="text-purple-700 font-black text-sm">+ R$ {extra.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-between gap-6 border-t border-gray-100 pt-8">
              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-[2rem]">
                <button onClick={() => setQuantity(p => Math.max(1, p-1))} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-purple-900 active:scale-90"><Minus size={22} /></button>
                <span className="font-black text-2xl w-6 text-center">{Math.floor(quantity)}</span>
                <button onClick={() => setQuantity(p => p+1)} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-purple-900 active:scale-90"><Plus size={22} /></button>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Total do Item</span>
                <span className="text-3xl font-black text-purple-950">R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleConfirm} 
              className="w-full bg-purple-900 text-white p-7 rounded-[2.8rem] font-black text-xl mt-10 flex justify-center items-center gap-4 shadow-2xl shadow-purple-200 active:scale-95 transition-all"
            >
              Confirmar Escolha <Check size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
