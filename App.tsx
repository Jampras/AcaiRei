
import React, { useState, useRef, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Category, Product } from './types';

// Hooks
import { useProducts, useCart, useAdmin } from './hooks';

// Components
import { Header, CategoryFilter, BottomNav } from './components/Layout';
import { PopularCarousel, ProductItem, ProductModal } from './components/Product';
import { FloatingCartButton, CartDrawer, CheckoutModal } from './components/Cart';
import { AdminLoginModal, AdminEditModal } from './components/Admin';

const App: React.FC = () => {
  // --- Hooks Instantiation ---
  const { products, saveProduct, toggleStock } = useProducts();
  const { cart, isCartOpen, setIsCartOpen, cartTotal, addToCart, updateQuantity, removeFromCart, cartPulse } = useCart();
  const { isAdmin, showAdminLogin, setShowAdminLogin, login, logout } = useAdmin();

  // --- Local UI State ---
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // --- Derived State ---
  const filteredProducts = useMemo(() => {
    return activeCategory === 'All' 
      ? products 
      : products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const popularProducts = useMemo(() => {
    return products.filter(p => p.popular && p.inStock);
  }, [products]);

  // --- Admin Timer Logic ---
  const adminTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startAdminTimer = () => {
    adminTimerRef.current = setTimeout(() => {
      if (isAdmin) {
        if (confirm("Deseja sair do modo de gerenciamento?")) logout();
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

  // --- Handlers ---
  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setClickedId(product.id);
    addToCart({ ...product, quantity: 1 });
    setTimeout(() => setClickedId(null), 800);
  };

  const handleEditProduct = (p: Partial<Product>) => {
    setEditingProduct(p);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-32 relative overflow-x-hidden bg-white selection:bg-purple-200">
      
      {/* Layout Components */}
      <Header 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        openCart={() => setIsCartOpen(true)}
        cartPulse={cartPulse}
        isAdmin={isAdmin}
        onAdminHold={startAdminTimer}
        onAdminHoldEnd={clearAdminTimer}
        onLogout={logout}
      />

      {/* Popular Carousel */}
      {!isAdmin && activeCategory === 'All' && (
        <PopularCarousel 
          products={popularProducts} 
          onSelect={setSelectedProduct} 
          onQuickAdd={handleQuickAdd}
          clickedId={clickedId}
        />
      )}

      {/* Categories */}
      <CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Main Product Grid */}
      <main className="px-6 mt-10">
        <h3 className="text-2xl font-black text-purple-950 mb-6 px-1">
          {activeCategory === 'All' ? 'Menu Completo' : activeCategory}
        </h3>
        <div className="grid grid-cols-1 gap-5">
          {filteredProducts.map((product, index) => (
            <ProductItem 
              key={product.id}
              product={product}
              isAdmin={isAdmin}
              delayIndex={index}
              clickedId={clickedId}
              onSelect={setSelectedProduct}
              onQuickAdd={handleQuickAdd}
              onToggleStock={toggleStock}
              onEdit={handleEditProduct}
              onAddCopy={(e) => { e.stopPropagation(); handleEditProduct({}); }}
            />
          ))}
          {isAdmin && (
            <button 
              onClick={() => handleEditProduct({category: 'Classic', inStock: true})} 
              className="w-full p-8 border-4 border-dashed border-purple-200 rounded-[2.5rem] flex flex-col items-center gap-3 text-purple-300 font-black hover:bg-purple-50 transition-all"
            >
              <Plus size={40} /> ADICIONAR NOVO ITEM
            </button>
          )}
        </div>
      </main>

      {/* Floating Action Components */}
      {!isAdmin && !selectedProduct && !isCartOpen && (
        <FloatingCartButton 
          count={cart.reduce((a, b) => a + b.quantity, 0)} 
          total={cartTotal} 
          openCart={() => setIsCartOpen(true)}
          pulse={cartPulse}
        />
      )}

      <BottomNav 
        setActiveCategory={setActiveCategory} 
        openCart={() => setIsCartOpen(true)} 
        cartCount={cart.length}
      />

      {/* Modals */}
      {selectedProduct && !isAdmin && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={(item) => {
            addToCart(item);
            setSelectedProduct(null);
          }}
        />
      )}

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        total={cartTotal}
        onUpdateQty={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        total={cartTotal}
      />

      <AdminLoginModal 
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={login}
      />

      <AdminEditModal 
        isOpen={isAdmin && isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        onSave={saveProduct}
      />
    </div>
  );
};

export default App;
