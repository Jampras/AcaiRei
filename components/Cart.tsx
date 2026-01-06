
import React, { useState } from 'react';
import { ShoppingCart, ChevronRight, X, Minus, Plus, Trash2, MapPin } from 'lucide-react';
import { CartItem, CheckoutFormData } from '../types';
import { WHATSAPP_NUMBER } from '../constants';

// --- Floating Cart Button ---
interface FloatingCartProps {
  count: number;
  total: number;
  openCart: () => void;
  pulse: boolean;
}

export const FloatingCartButton: React.FC<FloatingCartProps> = ({ count, total, openCart, pulse }) => {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-12 left-6 right-6 z-50 animate-slide-up">
      <button onClick={openCart} className={`w-full bg-purple-900 text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between group overflow-hidden relative active:scale-95 transition-all ${pulse ? 'ring-4 ring-yellow-400' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-950"></div>
        <div className="relative flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20"><ShoppingCart size={22} /></div>
          <div className="text-left"><span className="block text-[10px] uppercase font-black tracking-widest text-purple-300">Meu Pedido</span><span className="font-black text-lg">{count} itens</span></div>
        </div>
        <div className="relative flex items-center gap-1 bg-yellow-400 text-purple-950 px-5 py-2.5 rounded-[1.5rem] font-black text-lg shadow-lg">R$ {total.toFixed(2)}<ChevronRight size={20} className="animate-pulse" /></div>
      </button>
    </div>
  );
};

// --- Cart Drawer ---
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onUpdateQty: (id: string, name: string, delta: number) => void;
  onRemove: (id: string, name: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, onClose, cart, total, onUpdateQty, onRemove, onCheckout 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-end">
      <div className="absolute inset-0 bg-purple-950/70 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white rounded-t-[4rem] max-h-[90vh] overflow-y-auto flex flex-col animate-slide-up-full shadow-2xl">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto my-5 opacity-50"></div>
        <div className="px-10 flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-purple-950">Minha Sacola</h2>
          <button onClick={onClose} className="p-3 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all"><X size={24} /></button>
        </div>
        <div className="flex-1 px-10 space-y-5 mb-10">
          {cart.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex gap-5 items-center bg-gray-50/50 p-5 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <img src={item.image} className="w-20 h-20 rounded-[1.8rem] object-cover shadow-md" loading="lazy" />
              <div className="flex-1">
                <h5 className="font-black text-sm text-purple-950 line-clamp-1 leading-tight mb-1">{item.name}</h5>
                <span className="text-purple-600 font-black text-base">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                <button onClick={() => onUpdateQty(item.id, item.name, -1)} className="text-purple-900"><Minus size={16} /></button>
                <span className="font-black text-sm w-4 text-center">{Math.floor(item.quantity)}</span>
                <button onClick={() => onUpdateQty(item.id, item.name, 1)} className="text-purple-900"><Plus size={16} /></button>
              </div>
              <button onClick={() => onRemove(item.id, item.name)} className="text-red-300 p-2 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-purple-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart size={40} className="text-purple-200" />
              </div>
              <p className="text-gray-400 font-black text-lg px-10">Sua sacola está vazia.</p>
              <button onClick={onClose} className="mt-8 bg-purple-900 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">Ver Cardápio</button>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-10 bg-white border-t border-gray-100 rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-center mb-8 px-2">
              <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Valor Total</span>
              <span className="text-4xl font-black text-purple-950">R$ {total.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout} className="w-full bg-purple-900 text-white p-7 rounded-[2.8rem] font-black text-xl shadow-2xl shadow-purple-200 flex items-center justify-center gap-4 active:scale-95 transition-all">AVANÇAR PARA ENTREGA <ChevronRight size={28} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Checkout Modal ---
interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, total }) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '', address: '', neighborhood: '', paymentMethod: 'Pix'
  });

  if (!isOpen) return null;

  const handleFinalizeOrder = () => {
    if (!formData.name || !formData.address || !formData.neighborhood) {
      alert("Precisamos saber onde entregar sua dose de felicidade!");
      return;
    }

    const cartText = cart.map(item => `• *${item.quantity}x ${item.name}* - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const totalText = `*VALOR TOTAL: R$ ${total.toFixed(2)}*`;
    const deliveryText = `📍 *ONDE ENTREGAR:* ${formData.address}, ${formData.neighborhood}\n💳 *FORMA DE PAGAMENTO:* ${formData.paymentMethod}`;
    const userText = `👤 *CLIENTE:* ${formData.name}`;
    
    const message = `💜 *NOVO PEDIDO - AÇAÍ REAL* 💜\n\n${userText}\n\n📦 *ITENS SELECIONADOS:*\n${cartText}\n\n${totalText}\n\n${deliveryText}\n\n✨ Aguardo a confirmação para começar a preparar!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-purple-950/85 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-[4rem] p-10 animate-pop-in max-h-[92vh] overflow-y-auto shadow-2xl">
        <h2 className="text-3xl font-black text-purple-950 mb-10 flex items-center gap-3"><MapPin className="text-purple-600" /> Onde Entregar?</h2>
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-purple-400 tracking-widest px-2">Quem recebe?</label>
            <input placeholder="Ex: João Silva" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 font-bold transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-purple-400 tracking-widest px-2">Endereço Completo</label>
            <input placeholder="Rua e Número" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 font-bold transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-purple-400 tracking-widest px-2">Bairro</label>
            <input placeholder="Ex: Centro" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 font-bold transition-all" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase text-purple-400 mb-4 block tracking-widest px-2">Pagamento</span>
            <div className="grid grid-cols-3 gap-3">
              {['Pix', 'Cartão', 'Dinheiro'].map(m => (
                <button key={m} onClick={() => setFormData({...formData, paymentMethod: m as any})} className={`py-5 rounded-3xl font-black text-xs uppercase transition-all ${formData.paymentMethod === m ? 'bg-purple-900 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400'}`}>{m}</button>
              ))}
            </div>
          </div>
          <button onClick={handleFinalizeOrder} className="w-full bg-green-500 text-white p-7 rounded-[2.8rem] font-black text-2xl mt-6 flex justify-center items-center gap-4 shadow-xl shadow-green-200 active:scale-95 transition-all uppercase tracking-tighter">CONCLUIR PEDIDO 🚀</button>
        </div>
      </div>
    </div>
  );
};
