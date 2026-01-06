
import { Product } from './types';

export const WHATSAPP_NUMBER = "5587999279050";

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Clássico Real 300ml',
    description: 'Nossa base exclusiva: cremosidade extrema e o sabor autêntico que você ama. Simplesmente perfeito!',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Classic',
    popular: true,
    tag: 'O Queridinho',
    inStock: true
  },
  {
    id: '2',
    name: 'Vício Púrpura 500ml',
    description: 'Atenção: Altamente desejado! Camadas infinitas de Leite Ninho, morangos frescos e Nutella original.',
    price: 26.00,
    image: 'https://images.unsplash.com/photo-1623595110708-76b205332c9e?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Premium',
    popular: true,
    tag: 'Mais Vendido',
    inStock: true
  },
  {
    id: '3',
    name: 'Combo Duo Felicidade',
    description: 'A dose dupla de alegria! 2 Copos de 500ml completos para dividir ou dobrar sua dose de prazer.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1553177595-4de2bb0842b9?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Combos',
    tag: 'Economia Real',
    inStock: true
  },
  {
    id: '4',
    name: 'Banquete Imperial 1kg',
    description: 'O rei do cardápio! 1kg de pura energia com 8 acompanhamentos premium que derretem na boca.',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Combos',
    popular: true,
    tag: 'Dopamina Pura',
    inStock: true
  },
  {
    id: '5',
    name: 'Energia Fit 400ml',
    description: 'O combustível dos campeões. Açaí batido com Whey isolado, granola crocante e rodelas de banana.',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Premium',
    inStock: true
  },
  {
    id: '6',
    name: 'Extra Nutella Original',
    description: 'Aquele toque de luxo! Uma dose generosa da autêntica Nutella para mergulhar seu açaí.',
    price: 5.00,
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Acompanhamentos',
    inStock: true
  }
];

export const CATEGORIES: { id: any; label: string; icon: string }[] = [
  { id: 'Classic', label: 'Copos', icon: '🍧' },
  { id: 'Premium', label: 'Especiais', icon: '✨' },
  { id: 'Combos', label: 'Combos', icon: '🔥' },
  { id: 'Acompanhamentos', label: 'Extras', icon: '🚀' }
];
