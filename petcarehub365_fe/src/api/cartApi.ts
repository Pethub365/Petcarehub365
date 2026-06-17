import axiosClient from './axiosClient';

const cartApi = {
  getCart: () => axiosClient.get('/cart'),
  addToCart: (productId: string, quantity: number) => axiosClient.post('/cart', { productId, quantity }),
  updateCart: (itemId: string, quantity: number) => axiosClient.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId: string) => axiosClient.delete(`/cart/${itemId}`),
  checkout: (data: any) => axiosClient.post('/cart/checkout', data),
};

export default cartApi;
