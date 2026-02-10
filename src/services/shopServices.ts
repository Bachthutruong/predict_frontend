import api from './api';
import { getGuestId } from '../utils/guestCart';

export const shopAPI = {
    getProducts: (params: any) => api.get('/shop/products', { params }),
    getProduct: (id: string) => api.get(`/shop/products/${id}`),
    getCategories: () => api.get('/shop/categories'),
    validateCoupon: (data: { code: string; orderAmount: number; orderItems: any[] }) => api.post('/shop/coupons/validate', data),
};

// Guest: gửi guestId qua query/body để backend luôn nhận (phòng header X-Guest-Id bị strip)
export const cartAPI = {
    get: () => {
        const token = localStorage.getItem('token');
        const params = token ? undefined : { guestId: getGuestId() };
        return api.get('/cart', params ? { params } : {});
    },
    add: (productId: string, quantity: number, variant?: any) => {
        const token = localStorage.getItem('token');
        const body: Record<string, unknown> = { productId, quantity, variant };
        if (!token) body.guestId = getGuestId();
        return api.post('/cart/add', body);
    },
    update: (itemId: string, quantity: number) => {
        const token = localStorage.getItem('token');
        const body: Record<string, unknown> = { quantity };
        if (!token) (body as Record<string, unknown>).guestId = getGuestId();
        return api.put(`/cart/items/${itemId}`, body);
    },
    remove: (itemId: string) => {
        const token = localStorage.getItem('token');
        const config = token ? {} : { data: { guestId: getGuestId() } };
        return api.delete(`/cart/items/${itemId}`, config);
    },
    clear: () => {
        const token = localStorage.getItem('token');
        const body = token ? undefined : { guestId: getGuestId() };
        return api.delete('/cart/clear', body ? { data: body } : {});
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
