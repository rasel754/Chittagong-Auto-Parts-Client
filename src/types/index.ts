// Core TypeScript Definitions for Chittagong Auto Parts

export type Language = 'bn' | 'en';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff';
  shopId?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message?: string;
}

export interface Shop {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateShopInput {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  sku?: string;
  category?: string;
  availableStock: number; // in pcs
  buyingRate: number; // latest or avg buying price in BDT
  sellingRate: number; // standard selling price in BDT
  minStockAlert?: number;
  lastRestockedAt?: string;
  createdAt: string;
}

export interface StockEntry {
  id: string;
  shopId: string;
  shopName?: string;
  productId: string;
  productName: string;
  sku?: string;
  quantityReceived: number; // pcs
  buyingRate: number; // ৳ per pc
  sellingRate: number; // ৳ per pc
  totalPurchaseValue: number; // quantity * buyingRate
  supplierName: string;
  entryDate: string; // ISO date string
  notes?: string;
  currentAvailableStock?: number;
  createdAt: string;
}

export interface CreateStockEntryInput {
  shopId: string;
  productName: string;
  sku?: string;
  quantityReceived: number;
  buyingRate: number;
  sellingRate: number;
  supplierName: string;
  entryDate: string;
  notes?: string;
}

export interface UpdateStockEntryInput {
  shopId?: string;
  productName?: string;
  sku?: string;
  quantityReceived?: number;
  buyingRate?: number;
  sellingRate?: number;
  supplierName?: string;
  entryDate?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  shopId: string;
  shopName?: string;
  productId: string;
  productName: string;
  sku?: string;
  quantitySold: number; // pcs
  sellingRate: number; // ৳ per pc at time of sale
  discount?: number; // ৳ optional
  totalSellingPrice: number; // (quantity * rate) - discount
  costPriceAtSale?: number; // for profit calculation
  profit?: number;
  saleDate: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateSaleInput {
  shopId: string;
  productId: string;
  quantitySold: number;
  sellingRate: number;
  discount?: number;
  saleDate: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface UpdateSaleInput {
  shopId?: string;
  productId?: string;
  quantitySold?: number;
  sellingRate?: number;
  discount?: number;
  saleDate?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}


export type MovementType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'RETURN';

export interface StockHistoryItem {
  id: string;
  shopId: string;
  shopName?: string;
  productId: string;
  productName: string;
  sku?: string;
  movementType: MovementType;
  quantityChange: number; // e.g. +20 or -5
  resultingBalance: number;
  referenceId: string; // Stock entry ID or Invoice ID
  supplierOrCustomer?: string;
  date: string;
  notes?: string;
}

export interface DashboardKPIs {
  totalProducts: number;
  totalStockUnits: number; // pcs
  totalStockValue: number; // BDT
  totalSalesAmount: number; // BDT
  grossProfit?: number; // BDT (when cost info available)
  lowStockCount?: number;
  periodLabel?: string;
}

export interface SalesTrendDataPoint {
  date: string; // e.g. '2026-10-01' or '০১ অক্টো'
  salesAmount: number;
  unitsSold: number;
}

export interface ShopStockDistribution {
  shopId: string;
  shopName: string;
  totalUnits: number;
  totalStockValue: number;
  percentage: number;
}

export interface LowStockItem {
  id: string;
  shopId: string;
  shopName?: string;
  productName: string;
  sku?: string;
  availableStock: number;
  minStockAlert: number;
  sellingRate: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
