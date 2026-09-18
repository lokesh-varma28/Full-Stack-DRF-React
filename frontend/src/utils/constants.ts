export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ecommerce_access_token',
  REFRESH_TOKEN: 'ecommerce_refresh_token',
  USER: 'ecommerce_user',
};

export const PRODUCT_FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" fill="%23F8FAFC"/><rect x="4" y="4" width="392" height="392" rx="24" stroke="%23E2E8F0" stroke-width="4" fill="none"/><circle cx="200" cy="160" r="48" fill="%23EEF2FF"/><path d="M180 160L195 175L225 145" stroke="%236366F1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><text x="200" y="250" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="%2364748B" text-anchor="middle">No Image Available</text></svg>';
