 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Shop API - Public endpoints
export const shopApi = {
  // Products
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/shop/products?${searchParams}`);
    return response.json();
  },

  getProductById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/shop/products/${id}`);
    return response.json();
  },

  getProductCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/shop/products/categories`);
    return response.json();
  },

  getFeaturedProducts: async (limit = 8) => {
    const response = await fetch(`${API_BASE_URL}/shop/products/featured?limit=${limit}`);
    return response.json();
  },

  searchProducts: async (query: string, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/shop/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.json();
  },

  // Suggestion Packages
  getSuggestionPackages: async () => {
    const response = await fetch(`${API_BASE_URL}/shop/suggestion-packages`);
    return response.json();
  },

  // Coupons
  validateCoupon: async (code: string, orderAmount: number, orderItems: any[]) => {
    const response = await fetch(`${API_BASE_URL}/shop/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, orderAmount, orderItems }),
    });
    return response.json();
  },
};

// Cart API - Requires authentication
export const cartApi = {
  getCart: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  addToCart: async (token: string, productId: string, quantity = 1, variant?: any) => {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity, variant }),
    });
    return response.json();
  },

  updateCartItem: async (token: string, itemId: string, quantity: number) => {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  },

  removeFromCart: async (token: string, itemId: string) => {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  clearCart: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  applyCoupon: async (token: string, couponCode: string) => {
    const response = await fetch(`${API_BASE_URL}/cart/apply-coupon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ couponCode }),
    });
    return response.json();
  },

  removeCoupon: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/cart/remove-coupon`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};

// Order API - Requires authentication
export const orderApi = {
  getUserOrders: async (token: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    orderType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/orders?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getUserPointTopups: async (token: string, params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; }) => {
    const searchParams = new URLSearchParams();
    const qp: any = { orderType: 'points_topup', ...(params || {}) };
    Object.entries(qp).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const response = await fetch(`${API_BASE_URL}/orders?${searchParams}`, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.json();
  },

  getOrderById: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createOrder: async (token: string, orderData: {
    shippingAddress: any;
    paymentMethod: 'bank_transfer' | 'cod';
    couponCode?: string;
    usePoints?: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  submitPaymentConfirmation: async (token: string, orderId: string, paymentImage: string, note?: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/payment-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId, paymentImage, note }),
    });
    return response.json();
  },

  confirmDelivery: async (token: string, orderId: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm-delivery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  markDelivered: async (token: string, orderId: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/mark-delivered`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  cancelOrder: async (token: string, orderId: string, reason?: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },

  purchaseSuggestionPackage: async (token: string, packageId: string, shippingAddress?: any) => {
    const response = await fetch(`${API_BASE_URL}/orders/purchase-suggestion-package`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ packageId, shippingAddress }),
    });
    const data = await response.json().catch(() => ({ success: false, message: 'Unexpected response' }));
    if (!response.ok || data?.success === false) {
      const msg = (data && (data.message || data.error)) || `Purchase failed (${response.status})`;
      throw new Error(msg);
    }
    return data;
  },

  getUserSuggestionPackages: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/suggestion-packages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  useHint: async (token: string, predictionId: string) => {
    const response = await fetch(`${API_BASE_URL}/predictions/${predictionId}/use-hint`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  purchasePoints: async (token: string, amount: number) => {
    const response = await fetch(`${API_BASE_URL}/orders/purchase-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });
    return response.json();
  },
};

// Admin API - Requires admin authentication
export const adminApi = {
  // Users (for selectors)
  getUsers: async (token: string, params?: { page?: number; limit?: number; search?: string; }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    const response = await fetch(`${API_BASE_URL}/admin/users?${searchParams}`, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.json();
  },
  // Categories
  getCategories: async (token: string, params?: { page?: number; limit?: number; search?: string; isActive?: boolean; }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    const response = await fetch(`${API_BASE_URL}/admin/categories?${searchParams}`, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.json();
  },
  getCategoryById: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.json();
  },
  createCategory: async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    return response.json();
  },
  updateCategory: async (token: string, id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    return response.json();
  },
  deleteCategory: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    return response.json();
  },
  toggleCategoryStatus: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}/toggle-status`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
    return response.json();
  },
  // Products
  getProducts: async (token: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/products?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getProductById: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createProduct: async (token: string, productData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  updateProduct: async (token: string, id: string, productData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  deleteProduct: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  toggleProductStatus: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateProductStock: async (token: string, id: string, stock: number, operation = 'set') => {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ stock, operation }),
    });
    return response.json();
  },

  // Orders
  getOrders: async (token: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/orders?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // System Orders (new namespace)
  getSystemOrders: async (token: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${API_BASE_URL}/admin/system-orders?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getOrderById: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateOrderStatus: async (token: string, id: string, status: string, adminNotes?: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status, adminNotes }),
    });
    return response.json();
  },

  updatePaymentStatus: async (token: string, id: string, paymentStatus: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/payment-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentStatus }),
    });
    return response.json();
  },

  addTrackingNumber: async (token: string, id: string, trackingNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/tracking`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ trackingNumber }),
    });
    return response.json();
  },

  getOrderStatistics: async (token: string, period = 30) => {
    const response = await fetch(`${API_BASE_URL}/admin/system-orders/statistics?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // System order CRUD
  createSystemOrder: async (token: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/system-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  getSystemOrderById: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/system-orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  updateSystemOrder: async (token: string, id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/system-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  deleteSystemOrder: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/system-orders/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  updateSystemOrderStatus: async (token: string, id: string, status: string, adminNotes?: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/system-orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status, adminNotes }),
    });
    return response.json();
  },
  updateSystemPaymentStatus: async (token: string, id: string, paymentStatus: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/system-orders/${id}/payment-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ paymentStatus }),
    });
    return response.json();
  },

  cancelOrder: async (token: string, id: string, reason?: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },

  // Coupons
  getCoupons: async (token: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    discountType?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/coupons?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getCouponById: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createCoupon: async (token: string, couponData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(couponData),
    });
    return response.json();
  },

  updateCoupon: async (token: string, id: string, couponData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(couponData),
    });
    return response.json();
  },

  deleteCoupon: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  toggleCouponStatus: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getCouponStatistics: async (token: string, period = 30) => {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/statistics?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Suggestion Packages
  getSuggestionPackages: async (token: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/suggestion-packages?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getSuggestionPackageById: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/suggestion-packages/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createSuggestionPackage: async (token: string, packageData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/suggestion-packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(packageData),
    });
    return response.json();
  },

  updateSuggestionPackage: async (token: string, id: string, packageData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/suggestion-packages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(packageData),
    });
    return response.json();
  },

  deleteSuggestionPackage: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/suggestion-packages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  toggleSuggestionPackageStatus: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/suggestion-packages/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateSortOrder: async (token: string, packages: Array<{ id: string; sortOrder: number }>) => {
    const response = await fetch(`${API_BASE_URL}/admin/suggestion-packages/sort-order`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ packages }),
    });
    return response.json();
  },

  getSuggestionPackageStatistics: async (token: string, period = 30) => {
    const response = await fetch(`${API_BASE_URL}/admin/suggestion-packages/statistics?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  getPointPrice: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/settings/admin/point-price`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  updatePointPrice: async (token: string, pointPrice: number) => {
    const response = await fetch(`${API_BASE_URL}/settings/admin/point-price`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ pointPrice }),
    });
    return response.json();
  },
};

export const settingsApi = {
  getPointPrice: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/point-price`);
    return response.json();
  },
};
