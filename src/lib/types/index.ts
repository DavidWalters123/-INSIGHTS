// Add to your existing types
export interface Product {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'coaching';
  price: number;
  currency: string;
  delivery_method: 'on_demand' | 'live';
  category: string;
  visibility: 'public' | 'private';
  thumbnail_url?: string;
  creator_id: string;
  stripe_price_id?: string;
  created_at: any;
  updated_at?: any;
  status: 'draft' | 'published';
  enrolled_count?: number;
  duration?: number;
  learning_objectives?: string[];
  requirements?: string[];
  features?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: any;
  cancel_at_period_end: boolean;
  created_at: any;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}