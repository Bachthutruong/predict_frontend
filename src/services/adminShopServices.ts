import api from './api';

export const adminProductAPI = {
    getAll: (params: any) => api.get('/admin/products', { params }),
    getById: (id: string) => api.get(`/admin/products/${id}`),
    create: (data: any) => api.post('/admin/products', data),
    update: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
    delete: (id: string) => api.delete(`/admin/products/${id}`),
    updateStock: (id: string, data: { stock: number; operation: string; reason?: string; note?: string }) => api.patch(`/admin/products/${id}/stock`, data),
    getInventoryHistory: (id: string, params: any) => api.get(`/admin/products/${id}/inventory-history`, { params }),
    getCategories: () => api.get('/admin/products/categories'),
};

export const adminCategoryAPI = {
    getAll: (params?: any) => api.get('/admin/categories', { params }),
    getById: (id: string) => api.get(`/admin/categories/${id}`),
    create: (data: any) => api.post('/admin/categories', data),
    update: (id: string, data: any) => api.put(`/admin/categories/${id}`, data),
    delete: (id: string) => api.delete(`/admin/categories/${id}`),
    toggleStatus: (id: string) => api.patch(`/admin/categories/${id}/toggle-status`),
};

export const adminBranchAPI = {
    getAll: () => api.get('/admin/branches'),
    getById: (id: string) => api.get(`/admin/branches/${id}`),
    create: (data: any) => api.post('/admin/branches', data),
    update: (id: string, data: any) => api.put(`/admin/branches/${id}`, data),
    delete: (id: string) => api.delete(`/admin/branches/${id}`),
};

export const adminPaymentConfigAPI = {
    get: () => api.get('/admin/payment-config'),
    update: (data: any) => api.put('/admin/payment-config', data),
};

export const adminSystemOrderAPI = {
    getAll: (params: any) => api.get('/admin/system-orders', { params }),
    getById: (id: string) => api.get(`/admin/system-orders/${id}`),
    updateStatus: (id: string, status: string, notes?: string) => api.patch(`/admin/system-orders/${id}/status`, { status, adminNotes: notes }),
    updatePaymentStatus: (id: string, status: string) => api.patch(`/admin/system-orders/${id}/payment-status`, { paymentStatus: status }),
};
