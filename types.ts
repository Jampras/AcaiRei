
export type Category = 'Classic' | 'Premium' | 'Combos' | 'Acompanhamentos';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  popular?: boolean;
  tag?: string;
  inStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  paymentMethod: 'Pix' | 'Cartão' | 'Dinheiro';
}
