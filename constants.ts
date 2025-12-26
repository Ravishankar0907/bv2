
import { AddonSettings, Product, Role, User, VerificationStatus } from './types';

const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = IS_LOCALHOST ? 'https://katydid-fresh-verbally.ngrok-free.app' : '';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'PlayStation 5 Console',
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.',
    image: '/images/ps5_product.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000',
    category: 'Consoles',
    pricePerWeek: 50,
    pricePerMonth: 150, // Discounted monthly package
    stock: 5,
    totalStock: 5
  },
  {
    id: 'p2',
    name: 'PlayStation 4 Pro',
    description: 'Spectacular graphics – Explore vivid game worlds with rich visuals heightened by PS4 Pro. 1TB Storage.',
    image: '/images/ps4_product.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1507457379470-08b800bebc67?auto=format&fit=crop&q=80&w=1000',
    category: 'Consoles',
    pricePerWeek: 30,
    pricePerMonth: 80,
    stock: 8,
    totalStock: 8
  },
  {
    id: 'p3',
    name: 'PS5 DualSense Controller',
    description: 'Discover a deeper, highly immersive gaming experience that brings the action to life in the palms of your hands. Midnight Black.',
    image: '/images/jeshoots-com-eCktzGjC-iU-unsplash.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1592840496011-a58142b8e3e4?auto=format&fit=crop&q=80&w=1000',
    category: 'Accessories',
    pricePerWeek: 15,
    pricePerMonth: 40,
    stock: 10,
    totalStock: 10
  },
  {
    id: 'p4',
    name: 'PlayStation VR2',
    description: 'Escape into worlds that feel, look and sound truly real as virtual reality gaming takes a huge generational leap forward.',
    image: '/images/kamil-switalski-K_QbvoNqRvo-unsplash.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1622959632446-23961b6c7c1c?auto=format&fit=crop&q=80&w=1000',
    category: 'VR',
    pricePerWeek: 60,
    pricePerMonth: 180,
    stock: 2,
    totalStock: 2
  }
];

export const MOCK_ADDON_SETTINGS: AddonSettings = {
  psPlusPriceWeek: 500,
  psPlusPriceMonth: 1500,
  psPlusStock: 10,
  controllerPriceWeek: 800,
  controllerPriceMonth: 2500,
  controllerStock: 5
};

export const MOCK_ADMIN: User = {
  id: 'admin-1',
  name: 'System Admin',
  email: 'admin@battlevault.com',
  role: Role.ADMIN,
  savedLocations: [],
  idVerificationStatus: VerificationStatus.VERIFIED,
  password: 'admin',
  isPrimary: true
};

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: Role.USER,
  age: 28,
  phone: '555-0123',
  savedLocations: [
    {
      id: 'loc-1',
      name: 'Home',
      address: '123 Main St, Downtown',
      pincode: '10001',
      lat: 40.7128,
      lng: -74.0060
    }
  ],
  idVerificationStatus: VerificationStatus.VERIFIED,
  idProofUrl: 'https://via.placeholder.com/150'
};