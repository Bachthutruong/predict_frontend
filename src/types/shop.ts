export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  brand?: string;
  sku?: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  pointsReward: number;
  pointsRequired: number;
  canPurchaseWithPoints: boolean;
  tags: string[];
  variants?: ProductVariant[];
  freeShipping: boolean;
  shippingWeight?: number;
  viewCount: number;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  name: string;
  value: string;
  priceAdjustment: number;
  stock: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  pointsUsed: number;
  pointsEarned: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  pointsUsed: number;
  pointsEarned: number;
  coupon?: Coupon;
  couponCode: string;
  paymentMethod: 'bank_transfer' | 'cod';
  paymentStatus: 'pending' | 'waiting_confirmation' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'waiting_payment' | 'waiting_confirmation' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  paymentConfirmation?: {
    image: string;
    note: string;
    submittedAt: string;
  };
  adminNotes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: {
    id: string;
    name: string;
    email: string;
  };
  pointsRefunded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
  discountValue: number;
  usageLimit?: number;
  usedCount: number;
  usageLimitPerUser: number;
  minimumOrderAmount: number;
  minimumQuantity: number;
  applicableProducts: string[];
  applicableCategories: string[];
  excludedProducts: string[];
  applicableUsers: string[];
  newUserOnly: boolean;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  pointsBonus: number;
  totalDiscountGiven: number;
  totalOrdersAffected: number;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestionPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  suggestionCount: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  validityDays: number;
  purchaseCount: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSuggestion {
  id: string;
  user: string;
  package: SuggestionPackage;
  totalSuggestions: number;
  usedSuggestions: number;
  remainingSuggestions: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  purchasePrice: number;
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
  addedAt: string;
}

export interface Cart {
  id: string;
  user: string;
  items: CartItem[];
  coupon?: Coupon;
  couponCode: string;
  lastUpdated: string;
  subtotal: number;
  total: number;
  discount: number;
}

export interface OrderStatistics {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
  statusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  paymentStatusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

export interface CouponStatistics {
  overview: {
    totalCoupons: number;
    activeCoupons: number;
    totalUsage: number;
    totalDiscountGiven: number;
  };
  typeBreakdown: Array<{
    _id: string;
    count: number;
    totalUsage: number;
  }>;
}

export interface SuggestionPackageStatistics {
  overview: {
    totalPackages: number;
    activePackages: number;
    totalPurchases: number;
    totalRevenue: number;
  };
  popularPackages: Array<{
    name: string;
    purchaseCount: number;
    totalRevenue: number;
  }>;
}
