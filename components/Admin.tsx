
import React, { useRef, useState } from 'react';
import { X, Flame, Upload } from 'lucide-react';
import { Product, Category } from '../types';
import { CATEGORIES } from '../constants';

// --- Login Modal ---
interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (pass: string) => boolean;
}

export const AdminLoginModal: React.FC<AdminLoginProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (onLogin(password)) {
      setPassword('');
    } else {
      alert('Código incorreto!');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-purple-950/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-xs rounded-[3rem] p-8 animate-pop-in">
        <h2 className="text-2xl font-black text-purple-950 mb-2">Acesso Restrito</h2>
        <p className="text-gray-400 text-[10px] font-bold uppercase mb-6">Insira o código de autenticação</p>
        <input 
          type="password" placeholder="••••••••" value={password}
          className="w-full bg-gray-50 p-5 rounded-2xl border-2 mb-6 text-center font-black tracking-widest outline-none focus:border-purple-600"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter') handleSubmit(); }}
          autoFocus
        />
        <button onClick={handleSubmit} className="w-full bg-purple-900 text-white p-5 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">Desbloquear</button>
      </div>
    </div>
  );
};

// --- Edit Modal ---
interface AdminEditProps {
  isOpen: boolean;
  onClose: () => void;
  product: Partial<Product> | null;
  onSave: (p: Product) => void;
}

export const AdminEditModal: React.FC<AdminEditProps> = ({ isOpen, onClose, product, onSave }) => {
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(product);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update internal state when prop changes
  React.useEffect(() => {
    setEditingProduct(product);
  }, [product]);

  if (!isOpen || !editingProduct) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => prev ? { ...prev, image: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.name) return;

    const finalProduct = {
      ...editingProduct,
      id: editingProduct.id || Math.random().toString(36).substr(2, 9),
      inStock: editingProduct.inStock !== undefined ? editingProduct.inStock : true,
      popular: editingProduct.popular || false
    } as Product;

    onSave(finalProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      <div className="absolute inset-0 bg-purple-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-t-[3.5rem] max-h-[95vh] overflow-y-auto p-10 animate-slide-up-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-purple-950">{editingProduct.id ? 'Ajustar Item' : 'Novo Delícia'}</h2>
          <button onClick={onClose} className="p-3 bg-gray-100 rounded-full"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setEditingProduct({...editingProduct, popular: !editingProduct.popular})}
              className={`flex-1 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border-2 transition-all ${editingProduct.popular ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'bg-gray-50 border-transparent text-gray-400'}`}
            >
              <Flame size={16} /> Destaque Popular
            </button>
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-purple-400 tracking-widest px-2">Foto do Produto</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden border-2 border-purple-50">
                {editingProduct.image ? <img src={editingProduct.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Upload size={24} /></div>}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-purple-100 text-purple-700 font-black text-xs p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-200 transition-all"
              >
                <Upload size={16} /> Escolher Foto do Aparelho
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </div>
            <input placeholder="Ou cole a URL da imagem aqui" value={editingProduct.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl text-[10px] text-gray-400 outline-none" />
          </div>

          <input required placeholder="Nome do Produto" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-none outline-none focus:ring-2 ring-purple-600 font-bold" />
          <textarea required placeholder="Descrição" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-none outline-none focus:ring-2 ring-purple-600 font-medium" rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" step="0.01" placeholder="Preço" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full bg-gray-50 p-5 rounded-2xl font-bold" />
            <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as Category})} className="w-full bg-gray-50 p-5 rounded-2xl font-bold">
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          
          <button type="submit" className="w-full bg-purple-900 text-white p-7 rounded-[2.8rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all">
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};
