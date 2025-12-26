
export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

export enum RentalPeriod {
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum VerificationStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  pincode: string;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  age?: number;
  phone?: string;
  savedLocations: SavedLocation[];
  idVerificationStatus: VerificationStatus;
  idProofUrl?: string; // Legacy/On-demand
  hasIdProof?: boolean;
  notes?: string;
  password?: string;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image?: string;
  imageUrl?: string;
  category: string;
  pricePerWeek: number;
  pricePerMonth: number;
  stock: number;
  totalStock: number;
}

export interface AddonSettings {
  psPlusPriceWeek: number;
  psPlusPriceMonth: number;
  psPlusStock: number;
  controllerPriceWeek: number;
  controllerPriceMonth: number;
  controllerStock: number;
}

export interface OrderExpense {
  id: string;
  label: string;
  amount: number;
  date: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  duration: number;
  period: RentalPeriod;
  totalPrice: number;
  status: OrderStatus;
  deliveryLocation: SavedLocation;
  createdAt: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  psPlusExtra?: boolean;
  extraController?: boolean;
  expenses: OrderExpense[]; // New field for tagging expenses
}

export interface GlobalFinancials {
  salary: number;
  emi: number;
  subscriptions: number;
  ads: number;
  other: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}