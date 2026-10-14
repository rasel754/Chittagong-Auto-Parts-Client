import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { MockAdapter } from './mock-adapter';
import {
  User,
  Shop,
  Product,
  StockEntry,
  Sale,
  StockHistoryItem,
  CreateShopInput,
  CreateStockEntryInput,
  UpdateStockEntryInput,
  CreateSaleInput,
  UpdateSaleInput,
  PaginationParams,
  PaginatedResponse,
  DashboardKPIs,
  SalesTrendDataPoint,
  ShopStockDistribution,
} from '../types';

// Environment base URL (defaults to REST API v1)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://chittagong-auto-parts-server.vercel.app/api/v1'
    : 'http://localhost:5000/api/v1');
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 0,
});

// Request interceptor to attach JWT token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('cap_token') || localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiry, cold starts, and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retryCount?: number }) | undefined;
    const requestUrl = config?.url || '';

    // Auto-retry once for cold start or transient network glitch
    if (
      config &&
      (!config._retryCount || config._retryCount < 1) &&
      (error.message === 'Network Error' || !error.response || error.code === 'ECONNABORTED')
    ) {
      config._retryCount = (config._retryCount || 0) + 1;
      await new Promise((res) => setTimeout(res, 1500));
      return apiClient(config);
    }

    if (
      error.response?.status === 401 &&
      !requestUrl.includes('/auth/me') &&
      !requestUrl.includes('/auth/login')
    ) {
      localStorage.removeItem('cap_token');
      localStorage.removeItem('cap_user');
      localStorage.removeItem('auth_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts human-friendly error messages from backend API response envelopes
 */
export function extractErrorMessage(err: any, fallback: string = 'অনুরোধ সম্পন্ন করা যায়নি'): string {
  if (err.response?.data?.message) {
    const msg = err.response.data.message;
    if (msg === 'Invalid phone number or password') {
      return 'ফোন নম্বর অথবা পাসওয়ার্ড সঠিক নয়';
    }
    return msg;
  }
  if (err.response?.data?.error?.details) {
    const details = err.response.data.error.details;
    if (Array.isArray(details) && details.length > 0) {
      return details.map((d: any) => d.message || d.field).join(', ');
    }
    if (typeof details === 'object') {
      return Object.values(details).join(', ');
    }
  }
  if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'))) {
    return 'সার্ভার থেকে উত্তর পেতে দেরি হচ্ছে, অনুগ্রহ করে আবার চেষ্টা করুন';
  }
  if (err.message === 'Network Error' || !err.response) {
    return 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। ব্যাকএন্ড সার্ভার চালু আছে কিনা তা নিশ্চিত করুন।';
  }
  return err.message || fallback;
}

/**
 * Unified API Service connecting frontend components with the REST API backend.
 */
export const api = {
  // --- Auth ---
  ping: async (): Promise<void> => {
    if (!USE_MOCK) {
      try {
        await apiClient.get('/auth/ping');
      } catch {
        // Silently ignore ping errors
      }
    }
  },

  login: async (phone: string, password: string): Promise<{ user: User; token: string }> => {
    if (!USE_MOCK) {
      try {
        const res = await apiClient.post('/auth/login', { phone, password });
        const data = res.data?.data || res.data;
        const rawUser = data.user;
        const user: User = {
          id: rawUser.id || rawUser._id,
          name: rawUser.name,
          phone: rawUser.phone,
          role: (rawUser.role || 'staff').toLowerCase() as 'admin' | 'manager' | 'staff',
          shopId: rawUser.permittedShopIds?.[0] || undefined,
          createdAt: rawUser.createdAt,
        };
        return {
          token: data.token,
          user,
        };
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, 'লগইন ব্যর্থ হয়েছে'));
      }
    }
    return MockAdapter.login(phone, password);
  },

  getMe: async (): Promise<User | null> => {
    if (!USE_MOCK) {
      try {
        const res = await apiClient.get('/auth/me');
        const raw = res.data?.data || res.data;
        return {
          id: raw.id || raw._id,
          name: raw.name,
          phone: raw.phone,
          role: (raw.role || 'staff').toLowerCase() as 'admin' | 'manager' | 'staff',
          shopId: raw.permittedShopIds?.[0] || undefined,
          createdAt: raw.createdAt,
        };
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, 'প্রোফাইল লোড করা যায়নি'));
      }
    }
    const userStr = localStorage.getItem('cap_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // --- Shops ---
  getShops: async (): Promise<Shop[]> => {
    if (!USE_MOCK) {
      try {
        const res = await apiClient.get('/shops', { params: { limit: 100 } });
        const list = res.data?.data || res.data || [];
        return list.map((s: any) => ({
          id: s.id || s._id,
          name: s.name,
          code: s.code,
          address: s.address,
          phone: s.phone,
          isDefault: false,
          createdAt: s.createdAt || new Date().toISOString(),
          updatedAt: s.updatedAt,
        }));
      } catch (err: any) {
        console.warn('Backend unavailable, fallback to mock adapter for shops:', err.message);
      }
    }
    return MockAdapter.getShops();
  },


  getShopById: async (shopId: string): Promise<Shop> => {
    if (!USE_MOCK) {
      try {
        const res = await apiClient.get(`/shops/${shopId}`);
        const s = res.data?.data || res.data;
        return {
          id: s.id || s._id,
          name: s.name,
          code: s.code,
          address: s.address,
          phone: s.phone,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        };
      } catch (err: any) {
        console.warn('Backend unavailable for shop by id:', err.message);
      }
    }
    return MockAdapter.getShopById(shopId);
  },

  createShop: async (input: CreateShopInput): Promise<Shop> => {
    if (!USE_MOCK) {
      try {
        const res = await apiClient.post('/shops', {
          ...input,
          status: 'ACTIVE',
        });
        const s = res.data?.data || res.data;
        return {
          id: s.id || s._id,
          name: s.name,
          code: s.code,
          address: s.address,
          phone: s.phone,
          createdAt: s.createdAt,
        };
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, 'দোকান তৈরি ব্যর্থ হয়েছে'));
      }
    }
    return MockAdapter.createShop(input);
  },

  // --- Products & Inventory ---
  getProducts: async (shopId?: string): Promise<Product[]> => {
    if (!USE_MOCK) {
      try {
        if (shopId && shopId !== 'all') {
          // Fetch shop inventory balances (all tracked in-stock items)
          const res = await apiClient.get(`/shops/${shopId}/inventory`, {
            params: { limit: 1000, all: 'true' },
          });
          const items = res.data?.data || [];
          return items.map((inv: any) => {
            const p = inv.productId || {};
            return {
              id: p.id || p._id || inv.productId || inv.id,
              shopId: inv.shopId || shopId,
              name: p.name || 'পণ্য',
              sku: p.sku || '',
              category: 'অটো পার্টস',
              availableStock: inv.quantityOnHand ?? 0,
              buyingRate: inv.averageUnitCost ?? 0,
              sellingRate: inv.defaultSellingRatePerPiece ?? 0,
              minStockAlert: inv.lowStockThreshold ?? 5,
              createdAt: inv.createdAt,
            };
          });
        } else {
          // Fetch global products
          const res = await apiClient.get('/products', {
            params: { limit: 1000, all: 'true' },
          });
          const products = res.data?.data || [];
          return products.map((p: any) => ({
            id: p.id || p._id,
            shopId: '',
            name: p.name,
            sku: p.sku || '',
            category: 'অটো পার্টস',
            availableStock: 0,
            buyingRate: 0,
            sellingRate: 0,
            createdAt: p.createdAt,
          }));
        }
      } catch (err: any) {
        console.warn('Products endpoint error:', err.message);
      }
    }
    return MockAdapter.getProducts(shopId);
  },

  // --- Stock Entries ---
  getStockEntries: async (
    shopId?: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<StockEntry>> => {
    if (!USE_MOCK && shopId && shopId !== 'all') {
      try {
        const res = await apiClient.get(`/shops/${shopId}/stock-entries`, {
          params: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            search: params?.search?.trim() || undefined,
            startDate: params?.startDate,
            endDate: params?.endDate,
            sortBy: params?.sortBy || 'entryDate',
            sortOrder: params?.sortOrder || 'desc',
          },
        });
        const docs = res.data?.data || [];
        const meta = res.data?.meta || { total: docs.length, page: 1, limit: 10, totalPages: 1 };

        const mapped: StockEntry[] = docs.map((e: any) => ({
          id: e.id || e._id,
          shopId: e.shopId?.id || e.shopId?._id || e.shopId || shopId,
          shopName: e.shopId?.name || '',
          productId: e.productId?.id || e.productId?._id || e.productId,
          productName: e.productId?.name || e.productName || 'পণ্য',
          sku: e.productId?.sku || e.productSku || '',
          quantityReceived: e.quantityReceived,
          buyingRate: e.buyingRatePerPiece,
          sellingRate: e.sellingRatePerPiece || e.buyingRatePerPiece,
          totalPurchaseValue: e.totalPurchaseValue,
          supplierName: e.supplierName,
          entryDate: e.entryDate || e.createdAt,
          notes: e.notes,
          currentAvailableStock: e.quantityReceived,
          createdAt: e.createdAt,
        }));

        return {
          data: mapped,
          total: meta.total,
          page: meta.page,
          limit: meta.limit,
          totalPages: meta.totalPages,
        };
      } catch (err: any) {
        console.warn('Stock entries backend error:', err.message);
      }
    }
    return MockAdapter.getStockEntries(shopId, params);
  },

  createStockEntry: async (input: CreateStockEntryInput): Promise<StockEntry> => {
    if (!USE_MOCK) {
      try {
        const payload = {
          productName: input.productName,
          productSku: input.sku || undefined,
          supplierName: input.supplierName,
          quantityReceived: Number(input.quantityReceived),
          buyingRatePerPiece: Number(input.buyingRate),
          sellingRatePerPiece: Number(input.sellingRate),
          entryDate: input.entryDate ? new Date(input.entryDate).toISOString() : new Date().toISOString(),
          notes: input.notes,
        };
        const res = await apiClient.post(`/shops/${input.shopId}/stock-entries`, payload);
        const data = res.data?.data || res.data;
        return {
          id: data.id || data._id,
          shopId: input.shopId,
          productId: data.productId?.id || data.productId?._id || data.productId,
          productName: data.productId?.name || input.productName,
          sku: data.productId?.sku || input.sku,
          quantityReceived: data.quantityReceived,
          buyingRate: data.buyingRatePerPiece,
          sellingRate: data.sellingRatePerPiece,
          totalPurchaseValue: data.totalPurchaseValue,
          supplierName: data.supplierName,
          entryDate: data.entryDate,
          notes: data.notes,
          createdAt: data.createdAt,
        };
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, 'স্টক এন্ট্রি সংরক্ষণ করা সম্ভব হয়নি'));
      }
    }
    return MockAdapter.createStockEntry(input);
  },

  updateStockEntry: async (entryId: string, input: UpdateStockEntryInput): Promise<StockEntry> => {
    if (!USE_MOCK && input.shopId) {
      try {
        const payload = {
          productName: input.productName,
          productSku: input.sku || undefined,
          supplierName: input.supplierName,
          quantityReceived: input.quantityReceived !== undefined ? Number(input.quantityReceived) : undefined,
          buyingRatePerPiece: input.buyingRate !== undefined ? Number(input.buyingRate) : undefined,
          sellingRatePerPiece: input.sellingRate !== undefined ? Number(input.sellingRate) : undefined,
          entryDate: input.entryDate ? new Date(input.entryDate).toISOString() : undefined,
          notes: input.notes,
        };
        const res = await apiClient.put(`/shops/${input.shopId}/stock-entries/${entryId}`, payload);
        const data = res.data?.data || res.data;
        return {
          id: data.id || data._id,
          shopId: input.shopId,
          productId: data.productId?.id || data.productId?._id || data.productId,
          productName: data.productId?.name || input.productName,
          sku: data.productId?.sku || input.sku,
          quantityReceived: data.quantityReceived,
          buyingRate: data.buyingRatePerPiece,
          sellingRate: data.sellingRatePerPiece,
          totalPurchaseValue: data.totalPurchaseValue,
          supplierName: data.supplierName,
          entryDate: data.entryDate,
          notes: data.notes,
          createdAt: data.createdAt,
        };
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, 'স্টক এন্ট্রি আপডেট করা সম্ভব হয়নি'));
      }
    }
    return MockAdapter.updateStockEntry(entryId, input);
  },

  deleteStockEntry: async (shopId: string, entryId: string): Promise<{ success: boolean; message?: string }> => {
    if (!USE_MOCK && shopId) {
      try {
        const res = await apiClient.delete(`/shops/${shopId}/stock-entries/${entryId}`);
        return { success: true, message: res.data?.message || 'স্টক রেকর্ড সফলভাবে মুছে ফেলা হয়েছে' };
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, 'স্টক রেকর্ড মোছা সম্ভব হয়নি'));
      }
    }
    return MockAdapter.deleteStockEntry(shopId, entryId);
  },


  // --- Sales ---
  getSales: async (
    shopId?: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Sale>> => {
    if (!USE_MOCK && shopId && shopId !== 'all') {
      try {
        const res = await apiClient.get(`/shops/${shopId}/sales`, {
          params: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            search: params?.search?.trim() || undefined,
            startDate: params?.startDate,
            endDate: params?.endDate,
            sortBy: params?.sortBy || 'saleDate',
            sortOrder: params?.sortOrder || 'desc',
          },
        });
        const docs = res.data?.data || [];
        const meta = res.data?.meta || { total: docs.length, page: 1, limit: 10, totalPages: 1 };

        const mapped: Sale[] = docs.map((s: any) => ({
          id: s.id || s._id,
          invoiceNo: s.invoiceNo || `INV-${(s.id || s._id || '').slice(-6).toUpperCase()}`,
          shopId: s.shopId?.id || s.shopId?._id || s.shopId || shopId,
          shopName: s.shopId?.name || '',
          productId: s.productId?.id || s.productId?._id || s.productId,
          productName: s.productId?.name || 'পণ্য',
          sku: s.productId?.sku || '',
          quantitySold: s.quantitySold,
          sellingRate: s.sellingRatePerPiece,
          discount: 0,
          totalSellingPrice: s.totalSellingPrice,
          costPriceAtSale: s.unitCostAtSale,
          profit: s.grossProfit,
          saleDate: s.saleDate || s.createdAt,
          customerName: s.notes ? s.notes.split(' | ')[0]?.replace('ক্রেতা: ', '') : undefined,
          customerPhone: s.notes ? s.notes.split(' | ')[1]?.replace('ফোন: ', '') : undefined,
          notes: s.notes,
          createdAt: s.createdAt,
        }));

        return {
          data: mapped,
          total: meta.total,
          page: meta.page,
          limit: meta.limit,
          totalPages: meta.totalPages,
        };
      } catch (err: any) {
        console.warn('Sales backend error:', err.message);
      }
    }
    return MockAdapter.getSales(shopId, params);
  },

  createSale: async (input: CreateSaleInput): Promise<Sale> => {
    if (!USE_MOCK) {
      try {
        const noteParts = [];
        if (input.customerName) noteParts.push(`ক্রেতা: ${input.customerName}`);
        if (input.customerPhone) noteParts.push(`ফোন: ${input.customerPhone}`);
        if (input.notes) noteParts.push(input.notes);

        const payload = {
          productId: input.productId,
          quantitySold: Number(input.quantitySold),
          sellingRatePerPiece: Number(input.sellingRate),
          saleDate: input.saleDate ? new Date(input.saleDate).toISOString() : new Date().toISOString(),
          notes: noteParts.join(' | ') || undefined,
        };

        const res = await apiClient.post(`/shops/${input.shopId}/sales`, payload);
        const data = res.data?.data || res.data;
        return {
          id: data.id || data._id,
          invoiceNo: data.invoiceNo || `INV-${(data.id || data._id || '').slice(-6).toUpperCase()}`,
          shopId: input.shopId,
          productId: data.productId?.id || data.productId?._id || data.productId,
          productName: data.productId?.name || 'পণ্য',
          sku: data.productId?.sku || '',
          quantitySold: data.quantitySold,
          sellingRate: data.sellingRatePerPiece,
          discount: input.discount || 0,
          totalSellingPrice: data.totalSellingPrice,
          costPriceAtSale: data.unitCostAtSale,
          profit: data.grossProfit,
          saleDate: data.saleDate,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          notes: data.notes,
          createdAt: data.createdAt,
        };
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, 'বিক্রয় সম্পন্ন করা সম্ভব হয়নি'));
      }
    }
    return MockAdapter.createSale(input);
  },

  updateSale: async (saleId: string, input: UpdateSaleInput): Promise<Sale> => {
    if (!USE_MOCK && input.shopId) {
      try {
        const payload = {
          productId: input.productId,
          quantitySold: input.quantitySold !== undefined ? Number(input.quantitySold) : undefined,
          sellingRatePerPiece: input.sellingRate !== undefined ? Number(input.sellingRate) : undefined,
          saleDate: input.saleDate ? new Date(input.saleDate).toISOString() : undefined,
          notes: input.notes,
        };
        const res = await apiClient.put(`/shops/${input.shopId}/sales/${saleId}`, payload);
        const data = res.data?.data || res.data;
        return {
          id: data.id || data._id,
          invoiceNo: data.invoiceNo || `INV-${(data.id || data._id || '').slice(-6).toUpperCase()}`,
          shopId: input.shopId,
          productId: data.productId?.id || data.productId?._id || data.productId,
          productName: data.productId?.name || 'পণ্য',
          sku: data.productId?.sku || '',
          quantitySold: data.quantitySold,
          sellingRate: data.sellingRatePerPiece,
          discount: input.discount || 0,
          totalSellingPrice: data.totalSellingPrice,
          costPriceAtSale: data.unitCostAtSale,
          profit: data.grossProfit,
          saleDate: data.saleDate,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          notes: data.notes,
          createdAt: data.createdAt,
        };
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, 'বিক্রয় আপডেট করা সম্ভব হয়নি'));
      }
    }
    return MockAdapter.updateSale(saleId, input);
  },

  deleteSale: async (shopId: string, saleId: string): Promise<{ success: boolean; message?: string }> => {
    if (!USE_MOCK && shopId) {
      try {
        const res = await apiClient.delete(`/shops/${shopId}/sales/${saleId}`);
        return { success: true, message: res.data?.message || 'বিক্রয় রেকর্ড সফলভাবে মুছে ফেলা হয়েছে' };
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, 'বিক্রয় রেকর্ড মোছা সম্ভব হয়নি'));
      }
    }
    return MockAdapter.deleteSale(shopId, saleId);
  },


  // --- Stock History ---
  getStockHistory: async (
    shopId?: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<StockHistoryItem>> => {
    if (!USE_MOCK && shopId && shopId !== 'all') {
      try {
        const res = await apiClient.get(`/shops/${shopId}/stock-movements`, {
          params: {
            page: params?.page || 1,
            limit: params?.limit || 15,
            search: params?.search?.trim() || undefined,
          },
        });
        const docs = res.data?.data || [];
        const meta = res.data?.meta || { total: docs.length, page: 1, limit: 15, totalPages: 1 };

        const mapped: StockHistoryItem[] = docs.map((m: any) => ({
          id: m.id || m._id,
          shopId: m.shopId?.id || m.shopId?._id || m.shopId || shopId,
          shopName: m.shopId?.name || '',
          productId: m.productId?.id || m.productId?._id || m.productId,
          productName: m.productId?.name || 'পণ্য',
          sku: m.productId?.sku || '',
          movementType: m.movementType === 'STOCK_IN' ? 'STOCK_IN' : 'STOCK_OUT',
          quantityChange: m.quantityChange,
          resultingBalance: m.quantityAfter,
          referenceId: m.referenceId ? String(m.referenceId).slice(-8).toUpperCase() : 'N/A',
          supplierOrCustomer: m.notes || (m.movementType === 'STOCK_IN' ? 'সাপ্লায়ার ক্রয়' : 'বিক্রয় চালান'),
          date: m.createdAt || m.date || new Date().toISOString(),
          notes: m.notes,
        }));

        return {
          data: mapped,
          total: meta.total,
          page: meta.page,
          limit: meta.limit,
          totalPages: meta.totalPages,
        };
      } catch (err: any) {
        console.warn('Stock history backend error:', err.message);
      }
    }
    return MockAdapter.getStockHistory(shopId, params);
  },

  // --- Dashboard Data ---
  getDashboardData: async (
    shopId?: string,
    startDate?: string,
    endDate?: string,
    period?: string
  ): Promise<{
    kpis: DashboardKPIs;
    salesTrend: SalesTrendDataPoint[];
    shopDistribution: ShopStockDistribution[];
    lowStockProducts: Product[];
    recentSales: Sale[];
    recentStockEntries: StockEntry[];
  }> => {
    if (!USE_MOCK) {
      try {
        const isSingleShop = shopId && shopId !== 'all';
        const url = isSingleShop ? `/shops/${shopId}/dashboard` : '/dashboard/overview';
        const params: Record<string, string> = {};
        if (period) {
          params.period = period;
        } else if (startDate || endDate) {
          params.period = 'custom';
        } else {
          params.period = 'all_time';
        }
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await apiClient.get(url, { params });
        const raw = res.data?.data || res.data;
        const metrics = raw.metrics || {};

        const kpis: DashboardKPIs = {
          totalProducts: metrics.totalDistinctProducts ?? metrics.distinctProductCount ?? 0,
          totalStockUnits: metrics.totalStockUnits ?? metrics.totalQuantityOnHand ?? 0,
          totalStockValue: metrics.totalInventoryCostValue ?? metrics.inventoryCostValue ?? 0,
          totalSalesAmount: metrics.totalSalesRevenue ?? metrics.salesRevenue ?? 0,
          grossProfit: metrics.totalGrossProfit ?? metrics.grossProfit ?? 0,
          lowStockCount: (raw.lowStockAlerts || raw.lowStockProducts || []).length,
          periodLabel: isSingleShop ? 'শাখার সারসংক্ষেপ' : 'সকল শাখার সার্বিক হিসাব',
        };

        const recentSales: Sale[] = (raw.recentSales || []).map((s: any) => ({
          id: s.id || s._id,
          invoiceNo: s.invoiceNo || `INV-${(s.id || s._id || '').slice(-6).toUpperCase()}`,
          shopId: s.shopId?.id || s.shopId?._id || s.shopId || '',
          shopName: s.shopId?.name || '',
          productId: s.productId?.id || s.productId?._id || s.productId || '',
          productName: s.productId?.name || 'পণ্য',
          sku: s.productId?.sku || '',
          quantitySold: s.quantitySold,
          sellingRate: s.sellingRatePerPiece,
          totalSellingPrice: s.totalSellingPrice,
          saleDate: s.saleDate || s.createdAt,
          notes: s.notes,
          createdAt: s.createdAt,
        }));

        const recentStockEntries: StockEntry[] = (raw.recentStockEntries || []).map((e: any) => ({
          id: e.id || e._id,
          shopId: e.shopId?.id || e.shopId?._id || e.shopId || '',
          shopName: e.shopId?.name || '',
          productId: e.productId?.id || e.productId?._id || e.productId || '',
          productName: e.productId?.name || 'পণ্য',
          sku: e.productId?.sku || '',
          quantityReceived: e.quantityReceived,
          buyingRate: e.buyingRatePerPiece,
          sellingRate: e.sellingRatePerPiece || e.buyingRatePerPiece,
          totalPurchaseValue: e.totalPurchaseValue,
          supplierName: e.supplierName,
          entryDate: e.entryDate || e.createdAt,
          createdAt: e.createdAt,
        }));

        const lowStockProducts: Product[] = (raw.lowStockAlerts || raw.lowStockProducts || []).map((item: any) => {
          const p = item.productId || {};
          return {
            id: p.id || p._id || item.id || item._id,
            shopId: item.shopId?.id || item.shopId?._id || item.shopId || '',
            name: p.name || 'পণ্য',
            sku: p.sku || '',
            availableStock: item.quantityOnHand ?? 0,
            buyingRate: item.averageUnitCost ?? 0,
            sellingRate: item.defaultSellingRatePerPiece ?? 0,
            minStockAlert: item.lowStockThreshold ?? 5,
            createdAt: item.createdAt,
          };
        });

        // Shop Distribution
        const shopBreakdown = raw.shopBreakdown || [];
        const totalVal = kpis.totalStockValue || 1;
        const shopDistribution: ShopStockDistribution[] = shopBreakdown.map((sb: any) => ({
          shopId: sb.shopId,
          shopName: sb.shopName,
          totalUnits: sb.totalStockUnits,
          totalStockValue: sb.stockValue,
          percentage: Math.round((sb.stockValue / totalVal) * 100),
        }));

        // Build sales trend: use backend aggregation if provided, otherwise derive from recent sales
        let salesTrend: SalesTrendDataPoint[] = [];
        if (raw.salesTrend && Array.isArray(raw.salesTrend) && raw.salesTrend.length > 0) {
          salesTrend = raw.salesTrend.map((st: any) => ({
            date: st.date || st._id,
            salesAmount: st.salesAmount || 0,
            unitsSold: st.unitsSold || 0,
          }));
        } else {
          const dateMap: Record<string, { salesAmount: number; unitsSold: number }> = {};
          recentSales.forEach((s) => {
            const d = (s.saleDate || '').slice(0, 10);
            if (d) {
              if (!dateMap[d]) dateMap[d] = { salesAmount: 0, unitsSold: 0 };
              dateMap[d].salesAmount += s.totalSellingPrice;
              dateMap[d].unitsSold += s.quantitySold;
            }
          });

          const sortedDates = Object.keys(dateMap).sort();
          if (sortedDates.length > 0) {
            sortedDates.forEach((date) => {
              salesTrend.push({
                date,
                salesAmount: dateMap[date].salesAmount,
                unitsSold: dateMap[date].unitsSold,
              });
            });
          }
        }

        return {
          kpis,
          salesTrend,
          shopDistribution,
          lowStockProducts,
          recentSales,
          recentStockEntries,
        };
      } catch (err: any) {
        console.warn('Dashboard endpoint error, falling back to mock:', err.message);
      }
    }
    return MockAdapter.getDashboardData(shopId, startDate, endDate);
  },
};

