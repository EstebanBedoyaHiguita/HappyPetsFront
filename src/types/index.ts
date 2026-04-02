export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'agent' | 'customer';
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  department: string;
  zipCode: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  active: boolean;
}

export type ShippingZone = 'zone1' | 'zone2';

export interface City {
  _id: string;
  name: string;
  department: string;
  zone: ShippingZone;
  active: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  available: boolean;
  featured: boolean;
  salesCount: number;
  category?: Category;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: User;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: User;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface Transaction {
  reference_id: string;
  transaction_id: string;
  status: 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'PENDING';
  payment_method: 'CREDIT_CARD' | 'PSE' | 'BOTON_BANCOLOMBIA';
  payer_name: string;
  payer_email: string;
  createdAt: string;
}

export interface PSEBank {
  bank_code: string;
  bank_name: string;
}

export interface PaymentIntentResponse {
  reference_id: string;
  status: string;
}

export interface PaymentAttemptResponse {
  transaction_id: string;
  status: 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'PENDING';
  next_actions?: {
    redirect_url: string;
    redirect_method: string;
  };
  amount?: {
    currency: string;
    total_amount: number;
  };
}
