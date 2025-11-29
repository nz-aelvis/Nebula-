
export interface Product {
  id: string;
  name: string;
  sku: string;
  partNumber?: string;
  brand?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStockLevel?: number;
  category: string;
  description: string;
  imageUrl?: string;
  hsCode?: string;
  uom?: string;
  vatRate?: number;
  customFields?: Record<string, string | number | boolean>; // Dynamic fields
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  taxAmount?: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: OrderItem[];
  total: number;
  currency: string;
  customerName: string;
  customerNIF?: string;
  fiscalSignature?: string;
  ebmsResponseId?: string;
  taxAmount?: number;
  paymentMethod?: string;
  shippingAddress?: string;
  refundReason?: string;
}

export interface StockMovement {
    id: string;
    productId: string;
    quantity: number; // positive for add, negative for remove
    type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'transfer' | 'correction';
    reason: string;
    date: string;
    userId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  nif?: string;
  vatAssured: boolean;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface StoreProfile {
  storeName: string;
  nif: string;
  rc: string;
  legalForm: string;
  sector: string;
  vatAssured: boolean;
  address: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  baseCurrency: string;
  logoUrl?: string;
}

export interface SalesStat {
  date: string;
  amount: number;
}

export interface Vendor {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    category: string;
    address?: string;
}

export interface PurchaseOrder {
    id: string;
    vendorId: string;
    date: string;
    status: 'draft' | 'ordered' | 'received';
    totalCost: number;
    items: { productName: string; quantity: number; cost: number }[];
}

export interface Shipment {
    id: string;
    type: 'incoming' | 'outgoing';
    referenceId: string;
    status: 'processing' | 'in-transit' | 'customs' | 'delivered';
    carrier: string;
    estimatedArrival: string;
    notes?: string;
}

export interface Invoice {
    id: string;
    orderId: string;
    fiscalSignature: string;
    ebmsResponseId?: string;
    obrTime: string;
    customerName: string;
    tin: string;
    items: OrderItem[];
    total: number;
    vat: number;
    currency: string;
}

// --- CMS & Community ---

export interface BlogPost {
    id: string;
    title: string;
    content: string; // HTML or Markdown
    author: string;
    date: string;
    tags: string[];
    imageUrl?: string;
    status: 'draft' | 'published';
}

export interface Review {
    id: string;
    productId: string;
    customerName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
}

// --- Customization ---

export interface CustomFieldDefinition {
    id: string;
    target: 'product' | 'customer';
    label: string;
    type: 'text' | 'number' | 'boolean' | 'date';
    required: boolean;
}

export interface InvoiceTemplate {
    id: string;
    name: string;
    htmlContent: string; // Template with {{variables}}
    cssContent: string;
    isActive: boolean;
}

// --- User Management & RBAC ---

export interface RoleDefinition {
    id: string;
    name: string;
    permissions: Permission[];
}

export type Permission = 
    | 'view_dashboard'
    | 'manage_inventory'
    | 'manage_pos'
    | 'manage_orders'
    | 'manage_customers'
    | 'manage_finance'
    | 'manage_settings'
    | 'manage_users'
    | 'manage_content';

export interface User {
    id: string;
    name: string;
    email: string;
    roleId: string; // Links to RoleDefinition
    status: 'active' | 'inactive';
    lastLogin?: string;
    avatarUrl?: string;
    password?: string; // In real app, this would be a hash
}

export interface IntegrationConfig {
    id: string;
    provider: 'stripe' | 'ecocash' | 'lumicash' | 'twilio' | 'gemini' | 'smtp';
    name: string;
    apiKey: string;
    webhookUrl?: string;
    isEnabled: boolean;
    description: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  POS = 'POS',
  INVENTORY = 'INVENTORY',
  VENDORS = 'VENDORS',
  LOGISTICS = 'LOGISTICS',
  FISCAL = 'FISCAL',
  ORDERS = 'ORDERS',
  CUSTOMERS = 'CUSTOMERS',
  STOREFRONT = 'STOREFRONT',
  SETTINGS = 'SETTINGS',
  ADMIN_USERS = 'ADMIN_USERS',
  INTEGRATIONS = 'INTEGRATIONS',
  COMMUNITY = 'COMMUNITY' // Blog & Reviews
}
