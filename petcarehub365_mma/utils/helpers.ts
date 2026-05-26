/**
 * Get main image URL from a product/service object
 */
export const getItemMainImage = (item: any): string => {
  if (!item) return 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80';

  if (item.media && item.media.length > 0) {
    const sorted = [...item.media].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return sorted[0].url;
  }

  if (item.image_url) return item.image_url;

  return 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80';
};

/**
 * Format price to VND currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

/**
 * Format date to Vietnamese locale
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
};
