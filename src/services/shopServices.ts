import api from './api';

export const shopAPI = {
    getProducts: (params: any) => api.get('/shop/products', { params }),
    getProduct: (id: string) => api.get(`/shop/products/${id}`),
    getCategories: () => api.get('/shop/categories'),
    validateCoupon: (data: { code: string; orderAmount: number; orderItems: any[] }) => api.post('/shop/coupons/validate', data),
};

export const cartAPI = {
    get: () => {
        // Header is automatically added by api interceptor
        return api.get('/cart');
    },
    add: (productId: string, quantity: number, variant?: any) => {
        // Header is automatically added by api interceptor
        return api.post('/cart/add', { 
            productId, 
            quantity, 
            variant
        });
    },
    update: (itemId: string, quantity: number) => {
        // Header is automatically added by api interceptor
        return api.put(`/cart/items/${itemId}`, { quantity });
    },
    remove: (itemId: string) => {
        // Header is automatically added by api interceptor
        return api.delete(`/cart/items/${itemId}`);
    },
    clear: () => {
        // Header is automatically added by api interceptor
        return api.delete('/cart/clear');
    },
};

export const orderAPI = {
    create: (data: any) => api.post('/orders', data),
    getMyOrders: (params: any) => api.get('/orders', { params }),
    getById: (id: string) => api.get(`/orders/${id}`),
    markDelivered: (id: string) => api.put(`/orders/${id}/delivered`),
    submitPaymentProof: (id: string, data: any) => api.post(`/orders/payment-confirmation`, { orderId: id, ...data }),
};

export const reviewAPI = {
    getReviews: (productId: string) => api.get(`/reviews/product/${productId}`),
    create: (data: any) => api.post('/reviews', data),
};

export const chatAPI = {
    getHistory: () => api.get('/chat'),
    sendMessage: (content: string, attachments?: string[]) => api.post('/chat', { content, attachments }),

    // Admin
    getConversations: () => api.get('/chat/conversations'),
    getAdminChat: (userId: string) => api.get(`/chat/user/${userId}`),
    sendAdminMessage: (userId: string, content: string, attachments?: string[]) => api.post(`/chat/user/${userId}`, { content, attachments }),
};
