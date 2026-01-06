
import { Product } from './types';

export const WHATSAPP_NUMBER = "5587999279050";

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Clássico Irresistível 300ml',
    description: 'A base perfeita: cremosidade extrema e o sabor autêntico que você já conhece e ama. Simples, mas inesquecível.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Classic',
    popular: true,
    tag: 'O Favorito',
    inStock: true
  },
  {
    id: '2',
    name: 'Vício Púrpura 500ml',
    description: 'Atenção: Altamente viciante! O equilíbrio perfeito entre camadas de Leite Ninho, morangos selecionados e a verdadeira Nutella.',
    price: 26.00,
    image: 'https://images.unsplash.com/photo-1623595110708-76b205332c9e?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Premium',
    popular: true,
    tag: 'Campeão de Vendas',
    inStock: true
  },
  {
    id: '3',
    name: 'Duo Felicidade (Combo)',
    description: 'O crush perfeito existe e vem em dose dupla. 2 Copos de 500ml montados com amor para dividir momentos especiais.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1553177595-4de2bb0842b9?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Combos',
    tag: 'Economia Real',
    inStock: true
  },
  {
    id: '4',
    name: 'Banquete Imperial 1kg',
    description: 'A experiência definitiva. 1kg do nosso açaí especial coroado com 8 acompanhamentos premium que derretem na boca.',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Combos',
    popular: true,
    tag: 'Explosão de Dopamina',
    inStock: true
  },
  {
    id: '5',
    name: 'Energia Pura 400ml',
    description: 'O combustível dos campeões. Açaí batido com Whey, banana e nossa granola crocante artesanal secreta.',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Premium',
    inStock: true
  },
  {
    id: '6',
    name: 'Banho de Nutella',
    description: 'Porque nada é tão bom que um banho generoso da verdadeira Nutella original não possa transformar em perfeição.',
    price: 5.00,
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=400&h=400&auto=format&fit=crop',
    category: 'Acompanhamentos',
    inStock: true
  }
];

export const CATEGORIES: { id: any; label: string; icon: string }[] = [
  { id: 'Classic', label: 'Essenciais', icon: '💜' },
  { id: 'Premium', label: 'Assinaturas', icon: '✨' },
  { id: 'Combos', label: 'Para Dividir', icon: '🔥' },
  { id: 'Acompanhamentos', label: 'Turbinar', icon: '🚀' }
];
