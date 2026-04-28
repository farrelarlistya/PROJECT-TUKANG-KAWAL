/**
 * constants.js — Konstanta aplikasi
 */

export const USER_ROLES = {
  GUEST: 'guest',
  USER: 'non-member',
  MEMBER: 'member',
  ADMIN: 'admin',
};

export const ROUTES = {
  HOME: '/',
  CATEGORY: '/category/:slug',
  ARTICLE: '/article/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  ACCOUNT: '/account',
  ACCOUNT_INFO: '/account',
  ACCOUNT_SETTINGS: '/account/settings',
  ACCOUNT_SUBSCRIPTION: '/account/subscription',
  SUBSCRIPTION: '/subscription',
  MULAI_NGAWAL: '/mulai-ngawal',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_REVIEW: '/admin/review',
  ADMIN_WRITE: '/admin/write',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_USERS: '/admin/users',
  ADMIN_MEMBERSHIP: '/admin/membership',
};

export const DEFAULT_USERS = [
  {
    id: 1,
    email: 'admin@gmail.com',
    username: 'admin',
    password: 'admin123',
    role: USER_ROLES.ADMIN,
    initials: 'AD',
    fullName: 'Administrator',
  },
  {
    id: 2,
    email: 'user@gmail.com',
    username: 'user',
    password: 'user123',
    role: USER_ROLES.USER,
    initials: 'US',
    fullName: 'User Biasa',
  },
  {
    id: 3,
    email: 'member@gmail.com',
    username: 'member',
    password: 'member123',
    role: USER_ROLES.MEMBER,
    initials: 'MB',
    fullName: 'Member Premium',
  },
];

export const CATEGORIES = [
  { slug: 'business', apiCategory: 'business', label: 'Business', icon: '💼', badgeClass: 'bg-badge-business' },
  { slug: 'entertainment', apiCategory: 'entertainment', label: 'Entertainment', icon: '🎬', badgeClass: 'bg-badge-entertainment' },
  { slug: 'health', apiCategory: 'health', label: 'Health', icon: '🏥', badgeClass: 'bg-badge-health' },
  { slug: 'science', apiCategory: 'science', label: 'Science', icon: '🔬', badgeClass: 'bg-badge-science' },
  { slug: 'sports', apiCategory: 'sports', label: 'Sports', icon: '⚽', badgeClass: 'bg-badge-sports' },
  { slug: 'technology', apiCategory: 'technology', label: 'Technology', icon: '💻', badgeClass: 'bg-badge-technology' },
  { slug: 'eksklusif', apiCategory: 'general', label: 'Eksklusif', icon: '🔒', badgeClass: 'bg-badge-eksklusif' },
];

export const NEWS_CONFIG = {
  DEFAULT_COUNTRY: 'id',
  FALLBACK_COUNTRY: 'us',
  DEFAULT_PAGE_SIZE: 6,
  CACHE_DURATION_MS: 5 * 60 * 1000,
};
