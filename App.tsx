
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, ChevronLeft, ChevronRight, X, Minus, Plus, MapPin, 
  Flame, Star, Clock, Check, Settings, Trash2, 
  Edit3, Save, Power, Eye, EyeOff, Sparkles, ShoppingCart, Upload, LogOut
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
  const [cartPulse, setCartPulse] = useState(false);
  
  const adminTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
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

  const triggerCartPulse = () => {
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 1000);
  };

  const calculateProductModalTotal = () => {
    if (!selectedProduct) return 0;
    const extrasPrice = selectedExtras.reduce((acc, extraName) => {
      const extra = EXTRAS.find(e => e.name === extraName);
      return acc + (extra?.price || 0);
    }, 0);
    // Garantir que a quantidade seja tratada como inteiro
    return (selectedProduct.price + extrasPrice) * Math.floor(productQuantity);
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
      quantity: Math.floor(productQuantity) // Garantir inteiro
    };

    setCart(prev => [...prev, customizedProduct]);
    setSelectedProduct(null);
    setProductQuantity(1);
    setSelectedExtras([]);
    triggerCartPulse();
    if (navigator.vibrate) navigator.vibrate([30, 50]);
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
    
    triggerCartPulse();
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setClickedId(null), 800);
  };

  const removeFromCart = (id: string, name: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.name === name)));
  };

  const updateQuantity = (id: string, name: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.name === name) {
        const newQty = Math.max(1, Math.floor(item.quantity + delta));
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
    if (adminPassword === 'NexTec_Jp') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Código incorreto!');
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
    const userText = `👤 *CLIENTE:* ${formData.name}`;
    
    const message = `💜 *NOVO PEDIDO - AÇAÍ REAL* 💜\n\n${userText}\n\n📦 *ITENS SELECIONADOS:*\n${cartText}\n\n${totalText}\n\n${deliveryText}\n\n✨ Aguardo a confirmação para começar a preparar!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const startAdminTimer = () => {
    adminTimerRef.current = setTimeout(() => {
      if (isAdmin) {
        if (confirm("Deseja sair do modo de gerenciamento?")) {
          setIsAdmin(false);
        }
      } else {
        setShowAdminLogin(true);
      }
      if (navigator.vibrate) navigator.vibrate(200);
    }, 5000); 
  };

  const clearAdminTimer = () => {
    if (adminTimerRef.current) {
      clearTimeout(adminTimerRef.current);
      adminTimerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen pb-32 relative overflow-x-hidden bg-white selection:bg-purple-200">
      {/* Botão de Sair da Gestão (Visível apenas se Admin) */}
      {isAdmin && (
        <button 
          onClick={() => setIsAdmin(false)}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 border-2 border-white animate-bounce"
        >
          <LogOut size={14} /> Sair da Gestão
        </button>
      )}

      {/* Header Premium */}
      <header className="bg-purple-900 text-white rounded-b-[4rem] px-6 pt-10 pb-14 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 blur-[100px] -mr-40 -mt-40 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 blur-[80px] -ml-32 -mb-32 rounded-full"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h1 
              onPointerDown={startAdminTimer}
              onPointerUp={clearAdminTimer}
              onPointerLeave={clearAdminTimer}
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
              onClick={() => setIsCartOpen(true)}
              className={`relative p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 transition-all active:scale-90 hover:bg-white/20 ${cartPulse ? 'scale-110 bg-purple-500/30' : ''}`}
            >
              <ShoppingCart size={24} className={cartPulse ? 'text-yellow-400' : ''} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-purple-950 font-black text-[11px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-purple-900 animate-bounce">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
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

      {/* Popular Carousel */}
      {!isAdmin && activeCategory === 'All' && popularProducts.length > 0 && (
        <section className="mt-8 animate-fade-slide-up">
          <div className="px-6 mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black text-purple-950 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={20} /> Os Queridinhos
            </h3>
          </div>
          <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 px-6" style={{ scrollPaddingLeft: '1.5rem' }}>
            {popularProducts.map((product, idx) => (
              <div 
                key={`pop-${product.id}-${idx}`} 
                className="flex-shrink-0 w-[72vw] max-w-[280px] snap-start bg-purple-50 rounded-[3rem] p-4 border border-purple-100/50 group active:scale-[0.98] transition-all relative overflow-hidden"
              >
                <div onClick={() => setSelectedProduct(product)} className="cursor-pointer">
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
                    onClick={(e) => quickAddToCart(e, product)}
                    className={`p-3 rounded-2xl shadow-lg transition-all active:scale-90 ${clickedId === product.id ? 'bg-green-500 text-white' : 'bg-purple-900 text-white'}`}
                  >
                    {clickedId === product.id ? <Check size={18} /> : <Plus size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <div className="px-6 sticky top-4 z-40 mt-2">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-2 shadow-xl border border-purple-50 flex gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveCategory('All')} className={`flex-shrink-0 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeCategory === 'All' ? 'bg-purple-900 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400'}`}>Todos</button>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex-shrink-0 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${activeCategory === cat.id ? 'bg-purple-900 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400'}`}><span>{cat.icon}</span> {cat.label}</button>
          ))}
        </div>
      </div>

      {/* Main List */}
      <main className="px-6 mt-10">
        <h3 className="text-2xl font-black text-purple-950 mb-6 px-1">{activeCategory === 'All' ? 'Menu Completo' : CATEGORIES.find(c => c.id === activeCategory)?.label}</h3>
        <div className="grid grid-cols-1 gap-5">
          {filteredProducts.map((product, index) => (
            <div 
              key={`${product.id}-${index}`} 
              className={`bg-white rounded-[2.5rem] p-4 border border-purple-50 flex items-center gap-4 group transition-all active:scale-[0.98] animate-fade-slide-up opacity-0 shadow-sm hover:shadow-md ${product.inStock === false && !isAdmin ? 'grayscale opacity-60' : ''}`} 
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <div onClick={() => { if(!isAdmin && product.inStock) setSelectedProduct(product); }} className="flex-1 flex items-center gap-4 cursor-pointer">
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
                    <button onClick={(e) => toggleStock(product.id)} className={`p-2 rounded-xl ${product.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`} title="Ocultar/Exibir"><Eye size={16} /></button>
                    <button onClick={(e) => { setEditingProduct(product); setIsEditModalOpen(true); }} className="p-2 bg-blue-100 text-blue-600 rounded-xl" title="Editar"><Edit3 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingProduct(null); setIsEditModalOpen(true); }} className="p-2 bg-purple-100 text-purple-600 rounded-xl" title="Adicionar Novo"><Plus size={16} /></button>
                  </>
                ) : (
                  <button 
                    onClick={(e) => quickAddToCart(e, product)}
                    className={`p-3 rounded-2xl shadow-lg transition-all active:scale-90 ${clickedId === product.id ? 'bg-green-500 text-white' : 'bg-purple-900 text-white'}`}
                  >
                    {clickedId === product.id ? <Check size={18} /> : <Plus size={18} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isAdmin && (
            <button 
              onClick={() => { setEditingProduct({category: 'Classic', inStock: true}); setIsEditModalOpen(true); }} 
              className="w-full p-8 border-4 border-dashed border-purple-200 rounded-[2.5rem] flex flex-col items-center gap-3 text-purple-300 font-black hover:bg-purple-50 transition-all"
            >
              <Plus size={40} /> ADICIONAR NOVO ITEM
            </button>
          )}
        </div>
      </main>

      {/* Floating Action Cart */}
      {cart.length > 0 && !isCartOpen && !selectedProduct && !isAdmin && (
        <div className="fixed bottom-12 left-6 right-6 z-50 animate-slide-up">
          <button onClick={() => setIsCartOpen(true)} className={`w-full bg-purple-900 text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between group overflow-hidden relative active:scale-95 transition-all ${cartPulse ? 'ring-4 ring-yellow-400' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-950"></div>
            <div className="relative flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20"><ShoppingCart size={22} /></div>
              <div className="text-left"><span className="block text-[10px] uppercase font-black tracking-widest text-purple-300">Meu Pedido</span><span className="font-black text-lg">{cart.reduce((a, b) => a + b.quantity, 0)} itens</span></div>
            </div>
            <div className="relative flex items-center gap-1 bg-yellow-400 text-purple-950 px-5 py-2.5 rounded-[1.5rem] font-black text-lg shadow-lg">R$ {cartTotal.toFixed(2)}<ChevronRight size={20} className="animate-pulse" /></div>
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-purple-50 px-10 py-6 flex justify-around items-center z-40 rounded-t-[3.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => { setActiveCategory('All'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-purple-900 flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <Flame size={24} className={activeCategory === 'All' ? 'fill-purple-900' : ''} />
          <span className="text-[9px] font-black uppercase tracking-widest">Cardápio</span>
        </button>
        <button onClick={() => setIsCartOpen(true)} className="text-gray-400 flex flex-col items-center gap-1 active:scale-90 transition-transform relative">
          <ShoppingCart size={24} />
          {cart.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></span>}
          <span className="text-[9px] font-black uppercase tracking-widest">Sacola</span>
        </button>
      </nav>

      {/* Selection Modal (Product Page) */}
      {!isAdmin && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-purple-950/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white rounded-t-[4rem] h-[94vh] overflow-y-auto animate-slide-up-full shadow-2xl">
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="flex items-center gap-2 px-5 py-3 bg-white/95 backdrop-blur-md rounded-2xl text-purple-950 border border-purple-100 shadow-xl active:scale-90 transition-all font-black text-[10px] uppercase tracking-wider"
              >
                <ChevronLeft size={18} className="text-purple-600" /> Ver Cardápio
              </button>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="p-3 bg-white/95 rounded-2xl text-gray-400 shadow-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <img src={selectedProduct.image} className="h-[45vh] w-full object-cover" loading="lazy" />
            <div className="px-8 -mt-20 relative z-10 pb-16">
              <div className="bg-white rounded-[3.5rem] p-8 shadow-2xl border border-purple-50">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-3xl font-black text-purple-950 leading-tight">{selectedProduct.name}</h2>
                  <div className="bg-yellow-50 px-4 py-2 rounded-2xl text-yellow-600 font-black text-xs flex items-center gap-1.5 shadow-sm">
                    <Star size={16} className="fill-yellow-500 text-yellow-500" /> 5.0
                  </div>
                </div>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">{selectedProduct.description}</p>
                
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
                    <button onClick={() => setProductQuantity(p => Math.max(1, p-1))} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-purple-900 active:scale-90"><Minus size={22} /></button>
                    <span className="font-black text-2xl w-6 text-center">{Math.floor(productQuantity)}</span>
                    <button onClick={() => setProductQuantity(p => p+1)} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-purple-900 active:scale-90"><Plus size={22} /></button>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Total do Item</span>
                    <span className="text-3xl font-black text-purple-950">R$ {calculateProductModalTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleAddToCartFromModal} 
                  className="w-full bg-purple-900 text-white p-7 rounded-[2.8rem] font-black text-xl mt-10 flex justify-center items-center gap-4 shadow-2xl shadow-purple-200 active:scale-95 transition-all"
                >
                  Confirmar Escolha <Check size={24} />
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
          <div className="relative bg-white rounded-t-[4rem] max-h-[90vh] overflow-y-auto flex flex-col animate-slide-up-full shadow-2xl">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto my-5 opacity-50"></div>
            <div className="px-10 flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-purple-950">Minha Sacola</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-3 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all"><X size={24} /></button>
            </div>
            <div className="flex-1 px-10 space-y-5 mb-10">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-5 items-center bg-gray-50/50 p-5 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <img src={item.image} className="w-20 h-20 rounded-[1.8rem] object-cover shadow-md" loading="lazy" />
                  <div className="flex-1">
                    <h5 className="font-black text-sm text-purple-950 line-clamp-1 leading-tight mb-1">{item.name}</h5>
                    <span className="text-purple-600 font-black text-base">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <button onClick={() => updateQuantity(item.id, item.name, -1)} className="text-purple-900"><Minus size={16} /></button>
                    <span className="font-black text-sm w-4 text-center">{Math.floor(item.quantity)}</span>
                    <button onClick={() => updateQuantity(item.id, item.name, 1)} className="text-purple-900"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.name)} className="text-red-300 p-2 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-20">
                  <div className="bg-purple-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart size={40} className="text-purple-200" />
                  </div>
                  <p className="text-gray-400 font-black text-lg px-10">Sua sacola está vazia.</p>
                  <button onClick={() => setIsCartOpen(false)} className="mt-8 bg-purple-900 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">Ver Cardápio</button>
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-10 bg-white border-t border-gray-100 rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-center mb-8 px-2">
                  <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Valor Total</span>
                  <span className="text-4xl font-black text-purple-950">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-purple-900 text-white p-7 rounded-[2.8rem] font-black text-xl shadow-2xl shadow-purple-200 flex items-center justify-center gap-4 active:scale-95 transition-all">AVANÇAR PARA ENTREGA <ChevronRight size={28} /></button>
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
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-purple-950/90 backdrop-blur-sm" onClick={() => setShowAdminLogin(false)}></div>
          <div className="relative bg-white w-full max-w-xs rounded-[3rem] p-8 animate-pop-in">
            <h2 className="text-2xl font-black text-purple-950 mb-2">Acesso Restrito</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mb-6">Insira o código de autenticação</p>
            <input 
              type="password" placeholder="••••••••" value={adminPassword}
              className="w-full bg-gray-50 p-5 rounded-2xl border-2 mb-6 text-center font-black tracking-widest outline-none focus:border-purple-600"
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleAdminLogin(); }}
              autoFocus
            />
            <button onClick={handleAdminLogin} className="w-full bg-purple-900 text-white p-5 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">Desbloquear</button>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {isAdmin && isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div className="absolute inset-0 bg-purple-950/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white rounded-t-[3.5rem] max-h-[95vh] overflow-y-auto p-10 animate-slide-up-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-purple-950">{editingProduct.id ? 'Ajustar Item' : 'Novo Delícia'}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-6 pb-12">
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
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-up-full { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0; } 70% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fade-slide-up { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up-full { animation: slide-up-full 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-slide-up { animation: fade-slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default App;
