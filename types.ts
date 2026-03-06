
export enum Page {
  LANDING = 'landing',
  DASHBOARD = 'dashboard',
  ADMIN_DASHBOARD = 'admin_dashboard',
  STAFF_MANAGEMENT = 'staff_management',
  QUOTE = 'quote',
  ADD_PROPERTY = 'add_property',
  PRICING = 'pricing',
  REVIEW = 'review',
  GIVEAWAY = 'giveaway',
  THANKS = 'thanks',
  BONUS = 'bonus',
  ABOUT_US = 'about_us',
  CONTACT = 'contact'
}

export type UserRole = 'owner' | 'admin';

export interface User {
  name: string;
  email: string;
  phone?: string;
  password?: string; // For local auth simulation
  isLoggedIn: boolean;
  role: UserRole;
}

export interface InventoryItem {
  name: string;
  level: number; // 0 to 100
  status: 'optimal' | 'low' | 'critical';
}

export interface Property {
  id: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail: string; // Required for multi-tenant isolation
  name: string;
  address: string;
  beds: number;
  baths: number;
  inventory?: InventoryItem[];
  lastCleanReport?: string;
  calendarSynced?: boolean;
  listingDocUrl?: string;
  verificationStatus: 'unverified' | 'verified' | 'rejected';
  notes?: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface CleaningTask {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string; // Required for multi-tenant isolation
  beds: number;
  baths: number;
  type: 'basic' | 'standard' | 'premium';
  status: TaskStatus;
  scheduledAt: string;
  cleanerName?: string;
  cleanerPhone?: string;
  cleanerRole?: string;
  estimatedArrival?: string;
  price: number;
  notes?: string;
  listingDocUrl?: string;
  verificationStatus: 'unverified' | 'verified' | 'rejected';
}

export interface Cleaner {
  id: string;
  name: string;
  role: 'lead' | 'junior' | 'team';
  phone: string;
  status: 'active' | 'inactive';
  joinedAt: string;
}

export interface QuoteData {
  propertyId?: string;
  propertyName?: string;
  address?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  beds: number;
  baths: number;
  cleaningType: 'starter' | 'standard' | 'premium';
  isPriorityHost: boolean;
  laundry: boolean;
  toiletries: string[];
  frequency: 'one-time' | 'recurring';
  basePrice: number;
  totalPrice?: number;
  calendarUrl?: string;
  notes?: string;
  listingDocUrl?: string;
}

export interface Package {
  name: string;
  price: string;
  oldPrice?: string;
  period?: string;
  description?: string;
  features: string[];
  recommended?: boolean;
  buttonText?: string;
  smallText?: string;
  bonus?: string;
  badge?: string;
}

export interface AirolaNotification {
  id: string;
  type: 'quote_request' | 'booking_reminder' | 'cleaning_complete' | 'system' | 'dispatch';
  title: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  recipientRole: UserRole;
  recipientEmail?: string;
}
