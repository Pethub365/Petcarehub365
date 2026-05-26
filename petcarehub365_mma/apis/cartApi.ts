import axiosClient from './axiosClient';

/**
 * Cart API - Giỏ hàng sản phẩm / dịch vụ thú cưng
 */
const cartApi = {
    getCart: () => axiosClient.get('/cart'),
    addItem: (productId: string, variantId: string, quantity = 1) =>
        axiosClient.post('/cart/items', { productId, variantId, quantity }),
    updateItem: (itemId: string, quantity: number) =>
        axiosClient.patch(`/cart/items/${itemId}`, { quantity }),
    removeItem: (itemId: string) => axiosClient.delete(`/cart/items/${itemId}`),
    clearCart: () => axiosClient.delete('/cart'),
};

export default cartApi;
