import { API_BASE_URL, PRODUCT_FALLBACK_IMAGE } from './constants';

/**
 * Resolves a product or category image URL.
 * Handles Cloudinary HTTPS URLs, Django relative /media/ paths, and fallback SVGs.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return PRODUCT_FALLBACK_IMAGE;
  }

  const trimmed = url.trim();

  if (!trimmed || trimmed.includes('unsplash')) {
    return PRODUCT_FALLBACK_IMAGE;
  }

  // Upgrade insecure Cloudinary URLs to HTTPS
  if (trimmed.startsWith('http://res.cloudinary.com/')) {
    return trimmed.replace('http://res.cloudinary.com/', 'https://res.cloudinary.com/');
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${base}${path}`;
}
