
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CartItem, Category } from './types';
import { PRODUCTS } from './constants';

// --- Hook de Gerenciamento de Produtos ---
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('acai_real_products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch (e) {
      console.error("Erro ao carregar produtos", e);
      return PRODUCTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('acai_real_products', JSON.stringify(products));
    } catch (e) {
      console.error("Erro ao salvar produtos (provavelmente cota de armazenamento excedida por imagens)", e);
      alert("Aviso: O armazenamento local está cheio. Algumas alterações podem não ser salvas se usar muitas imagens pesadas.");
    }
  }, [products]);

  const saveProduct = useCallback((product: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? product : p);
      }
      return [...prev, product];
    });
  }, []);

  const toggleStock = useCallback((id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  }, []);

  return { products, saveProduct, toggleStock, setProducts };
};

// --- Hook de Gerenciamento do Carrinho ---
export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const triggerCartPulse = useCallback(() => {
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 1000);
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      // Verifica se existe um item IDÊNTICO (mesmo id, nome e extras - o nome já carrega os extras)
      const existingIndex = prev.findIndex(p => p.id === item.id && p.name === item.name);
      
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += item.quantity;
        return newCart;
      }
      return [...prev, item];
    });
    
    triggerCartPulse();
    if (navigator.vibrate) navigator.vibrate([30, 50]);
  }, [triggerCartPulse]);

  const updateQuantity = useCallback((id: string, name: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.name === name) {
        // Garante números inteiros
        const newQty = Math.max(1, Math.floor(item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }, []);

  const removeFromCart = useCallback((id: string, name: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.name === name)));
  }, []);

  return { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    cartTotal, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    cartPulse 
  };
};

// --- Hook de Admin ---
export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const login = useCallback((password: string) => {
    if (password === 'NexTec_Jp') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
  }, []);

  return { isAdmin, showAdminLogin, setShowAdminLogin, login, logout };
};
