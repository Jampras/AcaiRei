
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, ChevronRight, X, Minus, Plus, MapPin, Send, 
  Flame, Heart, Star, Clock, Check, Settings, Trash2, 
  Edit3, Save, Power, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { Product, CartItem, Category, CheckoutFormData } from './types';
import { PRODUCTS, CATEGORIES, WHATSAPP_NUMBER } from './constants';

const EXTRAS = [
  { id: 'extra-nutella', name: 'Nutella Original', price: 5.00 },
  { id: 'extra-ninho', name: 'Leite Ninho', price: 3.50 },
  { id: 'extra-morango', name: 'Morangos Frescos', price: 4.00 },
  { id: 'extra-pacoca', name: 'Paçoca Crocante', price: 2.50 },
];

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('acai_real_products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const [clickedId, setClickedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    phone: '',
    address: '',
    neighborhood: '',
    paymentMethod: 'Pix'
  });

  useEffect(() => {
    localStorage.setItem('acai_real_products', JSON.stringify(products));
  }, [products]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const popularProducts = useMemo(() => {
    return products.filter(p => p.popular && p.inStock);
  }, [products]);

  const toggleExtra = (extraName: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraName) ? prev.filter(e => e !== extraName) : [...prev, extraName]
    );
  };

  const calculateProductModalTotal = () => {
    if (!selectedProduct) return 0;
    const extrasPrice = selectedExtras.reduce((acc, extraName) => {
      const extra = EXTRAS.find(e => e.name === extraName);
      return acc + (extra?.price || 0);
    }, 0);
    return (selectedProduct.price + extrasPrice) * productQuantity;
  };

  const handleAddToCartFromModal = () => {
    if (!selectedProduct || selectedProduct.inStock === false) return;
    
    const extrasPrice = selectedExtras.reduce((acc, extraName) => {
      const extra = EXTRAS.find(e => e.name === extraName);
      return acc + (extra?.price || 0);
    }, 0);

    const customizedProduct: CartItem = {
      ...selectedProduct,
      name: selectedExtras.length > 0 ? `${selectedProduct.name} (+${selectedExtras.join(', ')})` : selectedProduct.name,
      price: selectedProduct.price + extrasPrice,
      quantity: productQuantity
    };

    setCart(prev => [...prev, customizedProduct]);
    setSelectedProduct(null);
    setProductQuantity(1);
    setSelectedExtras([]);
    setIsCartOpen(true);
  };

  const quickAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.inStock === false) return;

    setClickedId(product.id);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.name === product.name);
      if (existing) {
        return prev.map(item => (item.id === product.id && item.name === product.name) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    setTimeout(() => setClickedId(null), 600);
  };

  const removeFromCart = (id: string, name: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.name === name)));
  };

  const updateQuantity = (id: string, name: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.name === name) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const filteredProducts = useMemo(() => {
    return activeCategory === 'All' 
      ? products 
      : products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const handleAdminLogin = () => {
    if (adminPassword === '1234') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.id) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? (editingProduct as Product) : p));
    } else {
      const newProduct = {
        ...editingProduct,
        id: Math.random().toString(36).substr(2, 9),
        inStock: true
      } as Product;
      setProducts(prev => [...prev, newProduct]);
    }
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Deseja realmente remover este item do estoque?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const toggleStock = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  const handleFinalizeOrder = () => {
    if (!formData.name || !formData.address || !formData.neighborhood) {
      alert("Precisamos saber onde entregar sua dose de felicidade!");
      return;
    }

    const cartText = cart.map(item => `• *${item.quantity}x ${item.name}* - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const totalText = `*VALOR TOTAL: R$ ${cartTotal.toFixed(2)}*`;
    const deliveryText = `📍 *ONDE ENTREGAR:* ${formData.address}, ${formData.neighborhood}\n💳 *FORMA DE PAGAMENTO:* ${formData.paymentMethod}`;
    const userText = `👤 *CLIENTE:* ${formData.name}\n📞 *CONTATO:* ${formData.phone}`;
    
    const message = `💜 *NOVO PEDIDO - AÇAÍ REAL* 💜\n\n${userText}\n\n📦 *ITENS SELECIONADOS:*\n${cartText}\n\n${totalText}\n\n${deliveryText}\n\n✨ Aguardo a confirmação para começar a preparar!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-x-hidden bg-purple-50/30">
      {/* Header */}
      <header className="bg-purple-900 text-white rounded-b-[3.5rem] px-6 pt-12 pb-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-3xl -mr-20 -mt-20 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 blur-3xl -ml-10 -mb-10 rounded-full"></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div onClick={() => { if(!isAdmin) setShowAdminLogin(true); }} className="cursor-pointer">
            <h1 className="text-3xl font-display italic tracking-tight flex items-center gap-2">
              Açaí Real {isAdmin && <span className="bg-yellow-400 text-purple-950 text-[10px] px-2 py-0.5 rounded-full not-italic font-bold">ADM</span>}
            </h1>
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Aberto Agora
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button 
                onClick={() => setIsAdmin(false)}
                className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30 text-red-200"
              >
                <Power size={20} />
              </button>
            )}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-purple-700 rounded-2xl shadow-lg border border-purple-600 transition-transform active:scale-95"
            >
              <ShoppingBag size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-950 font-bold text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-purple-900 shadow-md animate-bounce">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            O melhor sabor <br/> da sua <span className="text-yellow-400">vida!</span>
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2">
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <Clock size={16} className="text-yellow-400" /> Voo Rápido (25 min)
            </div>
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <Star size={16} className="text-yellow-400 fill-yellow-400" /> Nota 5.0
            </div>
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <Flame size={16} className="text-orange-400" /> Sabor Extremo
            </div>
          </div>
        </div>
      </header>

      {/* Popular Carousel (Dopamina Section) - Optimized Scroll Snap */}
      {!isAdmin && activeCategory === 'All' && popularProducts.length > 0 && (
        <section className="mt-8 animate-fade-slide-up">
          <div className="px-6 mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black text-purple-900 flex items-center gap-2">
              <Sparkles className="text-yellow-500 animate-pulse" size={20} /> Explosão de Sabor
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-black text-purple-300 uppercase tracking-widest bg-purple-100/50 px-3 py-1 rounded-full">
              <span>Deslize</span>
              <ChevronRight size={12} className="animate-bounce-x" />
            </div>
          </div>
          <div 
            className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-8"
            style={{ 
              paddingLeft: '1.5rem', 
              paddingRight: '1.5rem',
              scrollPaddingLeft: '1.5rem',
              scrollPaddingRight: '1.5rem'
            }}
          >
            {popularProducts.map((product, idx) => (
              <div 
                key={`pop-${product.id}-${idx}`}
                onClick={() => setSelectedProduct(product)}
                className="flex-shrink-0 w-[78vw] max-w-[300px] snap-start bg-white rounded-[3.5rem] p-5 shadow-2xl shadow-purple-200/50 border border-purple-50 group active:scale-[0.97] transition-all duration-300"
              >
                <div className="relative h-60 w-full rounded-[2.8rem] overflow-hidden mb-5">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-transparent"></div>
                  
                  {product.tag && (
                    <div className="absolute top-4 left-4 bg-yellow-400 text-purple-950 text-[10px] font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-wider transform -rotate-2">
                      {product.tag}
                    </div>
                  )}
                  
                  <div className="absolute bottom-5 left-5 flex items-center gap-2">
                    <span className="text-lg font-black bg-white text-purple-900 px-4 py-1.5 rounded-full shadow-xl">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-black text-purple-950 text-lg leading-tight mb-2 px-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {product.name}
                </h4>
                <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-6 px-1">
                  {product.description}
                </p>
                
                <button className="w-full bg-purple-900 text-white py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-100 group-hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
                  Eu Quero Este! <Heart size={14} className="fill-current" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories Bar */}
      <div className="px-6 -mt-4 relative z-20">
        <div className="bg-white rounded-[2.5rem] p-3 shadow-2xl shadow-purple-100 flex gap-2 overflow-x-auto no-scrollbar border border-purple-50">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`flex-shrink-0 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${activeCategory === 'All' ? 'bg-purple-900 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-500 hover:bg-purple-50'}`}
          >
            Menu Completo
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${activeCategory === cat.id ? 'bg-purple-900 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-500 hover:bg-purple-50'}`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Quick Action */}
      {isAdmin && (
        <div className="px-6 mt-6">
          <button 
            onClick={() => {
              setEditingProduct({ name: '', description: '', price: 0, image: '', category: 'Classic', tag: '', inStock: true, popular: false });
              setIsEditModalOpen(true);
            }}
            className="w-full bg-yellow-400 text-purple-950 p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Plus size={20} /> ADICIONAR NOVO ITEM
          </button>
        </div>
      )}

      {/* Products List */}
      <main className="px-6 mt-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-purple-950">
            {activeCategory === 'All' ? 'Cardápio Completo' : CATEGORIES.find(c => c.id === activeCategory)?.label}
          </h3>
          <div className="h-1 bg-purple-100 flex-1 ml-6 rounded-full opacity-30"></div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.map((product, index) => (
            <div 
              key={`${product.id}-${index}`} 
              onClick={() => { if(!isAdmin) setSelectedProduct(product); }}
              className={`bg-white rounded-[3rem] p-4 shadow-xl shadow-purple-50/50 border border-purple-50 flex items-center gap-4 group transition-all active:scale-95 animate-fade-slide-up opacity-0 ${product.inStock === false && !isAdmin ? 'grayscale opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl hover:shadow-purple-100 hover:-translate-y-1'}`}
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <div className="relative w-28 h-28 flex-shrink-0 bg-purple-50 rounded-[2.2rem] overflow-hidden shadow-inner">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                {product.inStock === false && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-[10px] text-white font-black uppercase rotate-12 backdrop-blur-[2px]">
                    Esgotado
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-purple-950 text-base leading-tight line-clamp-1 group-hover:text-purple-600 transition-colors">{product.name}</h4>
                  {product.popular && <Flame className="text-orange-500 flex-shrink-0" size={16} />}
                </div>
                <p className="text-gray-400 text-[11px] line-clamp-2 mb-4 leading-relaxed">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700 font-black text-xl">R$ {product.price.toFixed(2)}</span>
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleStock(product.id); }} className={`p-2 rounded-xl transition-colors ${product.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {product.inStock ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setIsEditModalOpen(true); }} className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      disabled={product.inStock === false}
                      onClick={(e) => quickAddToCart(e, product)}
                      className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center shadow-xl transition-all duration-300 transform ${
                        product.inStock === false ? 'bg-gray-300 shadow-none' : clickedId === product.id ? 'bg-yellow-400 scale-125 shadow-yellow-200' : 'bg-purple-900 shadow-purple-200'
                      } text-white active:scale-90`}
                    >
                      {clickedId === product.id ? <Check size={20} className="text-purple-950 animate-pop-in" /> : <Plus size={22} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-purple-950/90 backdrop-blur-sm" onClick={() => setShowAdminLogin(false)}></div>
          <div className="relative bg-white w-full max-w-xs rounded-[3rem] p-8 animate-pop-in">
            <h2 className="text-2xl font-black text-purple-950 mb-6 flex items-center gap-2">Gestão Real</h2>
            <input 
              type="password" placeholder="Código Secreto" value={adminPassword}
              className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-transparent mb-6 text-center font-black tracking-widest outline-none focus:border-purple-600 transition-all"
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleAdminLogin(); }}
              autoFocus
            />
            <button onClick={handleAdminLogin} className="w-full bg-purple-900 text-white p-5 rounded-2xl font-bold shadow-2xl shadow-purple-100 active:scale-95 transition-transform">Entrar Agora</button>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {isAdmin && isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div className="absolute inset-0 bg-purple-950/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white rounded-t-[3.5rem] max-h-[95vh] overflow-y-auto p-10 animate-slide-up-full shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-purple-950">{editingProduct.id ? 'Ajustar' : 'Novo'} Delícia</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-6 pb-12">
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setEditingProduct({...editingProduct, popular: !editingProduct.popular})}
                  className={`flex-1 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border-2 transition-all ${editingProduct.popular ? 'bg-yellow-100 border-yellow-400 text-yellow-700 shadow-lg' : 'bg-gray-50 border-transparent text-gray-400'}`}
                >
                  <Flame size={16} /> Favorito da Galera
                </button>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-purple-400 mb-2 block tracking-widest px-1">Nome</label>
                <input required placeholder="Nome do Produto" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-purple-400 mb-2 block tracking-widest px-1">Descrição</label>
                <textarea required placeholder="Fale sobre o sabor..." value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 transition-all font-medium" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-purple-400 mb-2 block tracking-widest px-1">Preço</label>
                  <input required type="number" step="0.01" placeholder="R$" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 transition-all font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-purple-400 mb-2 block tracking-widest px-1">Categoria</label>
                  <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as Category})} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 transition-all font-bold">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <input required placeholder="Link da Foto" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 transition-all" />
              <input placeholder="Tag em Destaque" value={editingProduct.tag} onChange={e => setEditingProduct({...editingProduct, tag: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 transition-all" />
              <button type="submit" className="w-full bg-purple-900 text-white p-6 rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-purple-100 hover:bg-purple-800 transition-all active:scale-95"><Save size={24} /> Atualizar Cardápio</button>
            </form>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {!isAdmin && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-purple-950/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white rounded-t-[4rem] h-[94vh] overflow-y-auto animate-slide-up-full shadow-[0_-25px_60px_rgba(0,0,0,0.3)]">
            <div className="absolute top-8 right-8 z-10">
              <button onClick={() => setSelectedProduct(null)} className="p-4 bg-white/20 backdrop-blur-xl rounded-full text-white border border-white/40 shadow-2xl hover:bg-white/30 transition-colors">
                <X size={28} />
              </button>
            </div>
            <img src={selectedProduct.image} className="h-[45vh] w-full object-cover" loading="lazy" />
            <div className="px-8 -mt-16 relative z-10 pb-12">
              <div className="bg-white rounded-[3.5rem] p-8 shadow-2xl border border-purple-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-400 tracking-[0.2em] mb-2 block">{selectedProduct.category}</span>
                    <h2 className="text-3xl font-black text-purple-950 leading-tight">{selectedProduct.name}</h2>
                  </div>
                  <div className="bg-yellow-50 px-4 py-2 rounded-2xl text-yellow-600 font-black text-xs flex items-center gap-1.5 shadow-sm border border-yellow-100">
                    <Star size={16} className="fill-yellow-500 text-yellow-500" /> 5.0
                  </div>
                </div>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">{selectedProduct.description}</p>
                
                <h4 className="text-xs font-black uppercase text-purple-900 tracking-widest mb-6 flex items-center gap-2">
                  <Plus size={14} className="text-purple-600" /> Turbinar Experiência
                </h4>
                <div className="space-y-3 mb-10">
                  {EXTRAS.map(extra => (
                    <button 
                      key={extra.id} 
                      onClick={() => toggleExtra(extra.name)} 
                      className={`w-full flex justify-between p-5 rounded-[2rem] border-2 transition-all duration-300 ${selectedExtras.includes(extra.name) ? 'border-purple-600 bg-purple-50 shadow-xl shadow-purple-100/50 scale-[1.02]' : 'border-gray-50 bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                      <div className="flex gap-4 items-center">
                        <div className={`w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center ${selectedExtras.includes(extra.name) ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}>
                          {selectedExtras.includes(extra.name) && <Check size={16} className="text-white" />}
                        </div>
                        <span className={`font-bold text-sm ${selectedExtras.includes(extra.name) ? 'text-purple-900' : 'text-gray-500'}`}>{extra.name}</span>
                      </div>
                      <span className="text-purple-700 font-black text-sm">+ R$ {extra.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-6 border-t border-gray-100 pt-8">
                  <div className="flex items-center gap-5 bg-purple-50 p-2.5 rounded-[2.2rem] border border-purple-100">
                    <button onClick={() => setProductQuantity(p => Math.max(1, p-1))} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-purple-900 active:scale-90 transition-all hover:bg-purple-900 hover:text-white"><Minus size={22} /></button>
                    <span className="font-black text-2xl w-6 text-center text-purple-950">{productQuantity}</span>
                    <button onClick={() => setProductQuantity(p => p+1)} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-purple-900 active:scale-90 transition-all hover:bg-purple-900 hover:text-white"><Plus size={22} /></button>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Total Geral</span>
                    <span className="text-3xl font-black text-purple-950">R$ {calculateProductModalTotal().toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={handleAddToCartFromModal} className="w-full bg-purple-900 text-white p-7 rounded-[2.8rem] font-black text-xl mt-10 flex justify-center items-center gap-4 shadow-[0_20px_40px_rgba(88,28,135,0.25)] hover:bg-purple-800 transition-all active:scale-95">
                  Confirmar Pedido <ShoppingBag size={26} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[120] flex flex-col justify-end">
          <div className="absolute inset-0 bg-purple-950/70 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative bg-white rounded-t-[4rem] max-h-[92vh] overflow-y-auto flex flex-col animate-slide-up-full shadow-2xl">
            <div className="w-20 h-2 bg-gray-200 rounded-full mx-auto my-6 opacity-50"></div>
            <div className="px-10 flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-purple-950">Seu Banquete</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-3 bg-gray-100 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><X size={24} /></button>
            </div>
            <div className="flex-1 px-10 space-y-5 mb-10">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-5 items-center bg-gray-50/50 p-5 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                  <img src={item.image} className="w-20 h-20 rounded-[1.8rem] object-cover shadow-md" loading="lazy" />
                  <div className="flex-1">
                    <h5 className="font-black text-sm text-purple-950 line-clamp-1 leading-tight mb-1">{item.name}</h5>
                    <span className="text-purple-600 font-black text-base">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-inner border border-gray-100">
                    <button onClick={() => updateQuantity(item.id, item.name, -1)} className="p-2 text-purple-900 hover:bg-purple-50 rounded-xl transition-colors"><Minus size={16} /></button>
                    <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.name, 1)} className="p-2 text-purple-900 hover:bg-purple-50 rounded-xl transition-colors"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.name)} className="text-red-300 p-2 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-20">
                  <div className="bg-purple-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <ShoppingBag size={40} className="text-purple-200" />
                  </div>
                  <p className="text-gray-400 font-black text-lg px-10">Ainda não escolheu? O seu açaí ideal te espera!</p>
                  <button onClick={() => setIsCartOpen(false)} className="mt-6 text-purple-600 font-black uppercase tracking-widest text-xs hover:underline">Voltar para o Menu</button>
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-10 bg-white border-t border-gray-100 rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-center mb-8 px-2">
                  <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Total dos Vícios</span>
                  <span className="text-4xl font-black text-purple-950">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-purple-900 text-white p-7 rounded-[2.8rem] font-black text-xl shadow-2xl shadow-purple-200 flex items-center justify-center gap-4 hover:bg-purple-800 transition-all active:scale-95">Finalizar Pedido <ChevronRight size={28} /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-purple-950/85 backdrop-blur-md" onClick={() => setIsCheckoutOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[4rem] p-10 animate-pop-in max-h-[92vh] overflow-y-auto shadow-2xl">
            <h2 className="text-3xl font-black text-purple-950 mb-10 flex items-center gap-3"><MapPin className="text-purple-600" /> Onde Entregamos?</h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest px-2">Quem recebe?</label>
                <input placeholder="Seu Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 font-bold transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest px-2">WhatsApp</label>
                <input placeholder="(00) 00000-0000" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 font-bold transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest px-2">Endereço</label>
                <input placeholder="Rua, Número e Complemento" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 font-bold transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest px-2">Bairro</label>
                <input placeholder="Bairro" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-transparent outline-none focus:border-purple-600 font-bold transition-all" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-400 mb-4 block tracking-widest px-2">Forma de Pagamento</span>
                <div className="grid grid-cols-3 gap-3">
                  {['Pix', 'Cartão', 'Dinheiro'].map(m => (
                    <button key={m} onClick={() => setFormData({...formData, paymentMethod: m as any})} className={`py-5 rounded-3xl font-black text-xs uppercase tracking-tighter transition-all ${formData.paymentMethod === m ? 'bg-purple-900 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{m}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleFinalizeOrder} className="w-full bg-green-500 text-white p-7 rounded-[2.8rem] font-black text-xl mt-6 flex justify-center items-center gap-4 shadow-xl shadow-green-100 hover:bg-green-600 transition-all active:scale-95">Pedir Agora via WhatsApp 🚀</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button (Bottom) */}
      {cart.length > 0 && !isCartOpen && !selectedProduct && !isAdmin && (
        <div className="fixed bottom-28 left-6 right-6 z-40 animate-slide-up">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-purple-900 text-white p-6 rounded-[3rem] shadow-[0_25px_60px_rgba(88,28,135,0.4)] flex items-center justify-between group overflow-hidden relative active:scale-95 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 opacity-60 animate-gradient-x"></div>
            <div className="relative flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20"><ShoppingBag size={24} /></div>
              <div className="text-left">
                <span className="block text-[10px] uppercase font-black tracking-[0.2em] text-purple-300 mb-0.5">Meu Carrinho</span>
                <span className="font-black text-lg">{cart.reduce((a, b) => a + b.quantity, 0)} itens prontos</span>
              </div>
            </div>
            <div className="relative flex items-center gap-2 bg-yellow-400 text-purple-950 px-6 py-3 rounded-[1.8rem] font-black text-lg shadow-xl shadow-yellow-200/50">
              R$ {cartTotal.toFixed(2)}
              <ChevronRight size={22} className="animate-bounce-x" />
            </div>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-purple-50 px-12 py-6 flex justify-between items-center z-40 rounded-t-[3.5rem] shadow-[0_-15px_50px_rgba(88,28,135,0.08)]">
        <button className="text-purple-900 flex flex-col items-center gap-1.5 transition-all active:scale-90" onClick={() => setActiveCategory('All')}>
          <div className="bg-purple-900 p-3 rounded-2xl text-white shadow-lg shadow-purple-200"><Flame size={24} /></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Início</span>
        </button>
        <button className="text-gray-300 flex flex-col items-center gap-1.5 transition-all active:scale-90 group" onClick={() => setIsCartOpen(true)}>
          <div className="p-3 rounded-2xl group-hover:bg-purple-50 group-hover:text-purple-900 transition-all"><ShoppingBag size={24} /></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Carrinho</span>
        </button>
        <button className="text-gray-300 flex flex-col items-center gap-1.5 transition-all active:scale-90 group" onClick={() => { if(!isAdmin) setShowAdminLogin(true); }}>
          <div className="p-3 rounded-2xl group-hover:bg-purple-50 group-hover:text-purple-900 transition-all"><Settings size={24} /></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Painel</span>
        </button>
      </nav>

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-up-full { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fade-slide-up { 0% { transform: translateY(40px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up-full { animation: slide-up-full 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-slide-up { animation: fade-slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-bounce-x { animation: bounce-x 1s infinite ease-in-out; }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 6s infinite ease-in-out; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-x { scroll-snap-type: x mandatory; }
        .snap-start { scroll-snap-align: start; }
        .snap-center { scroll-snap-align: center; }
        
        /* Smooth scrolling for entire page and carousel */
        html { scroll-behavior: smooth; }
        
        /* High density shadows for dopamine feel */
        .shadow-purple-200 { shadow: 0 10px 30px -5px rgba(88, 28, 135, 0.3); }
      `}</style>
    </div>
  );
};

export default App;
