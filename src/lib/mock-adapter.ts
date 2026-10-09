import {
  User,
  Shop,
  Product,
  StockEntry,
  Sale,
  StockHistoryItem,
  DashboardKPIs,
  SalesTrendDataPoint,
  ShopStockDistribution,
  CreateShopInput,
  CreateStockEntryInput,
  UpdateStockEntryInput,
  CreateSaleInput,
  UpdateSaleInput,
  PaginatedResponse,
  PaginationParams,
} from '../types';

const STORAGE_KEYS = {
  SHOPS: 'cap_v2_shops',
  PRODUCTS: 'cap_v2_products',
  STOCK_ENTRIES: 'cap_v2_stock_entries',
  SALES: 'cap_v2_sales',
  STOCK_HISTORY: 'cap_v2_stock_history',
};

// Purge legacy mock fake data from browser cache
try {
  ['cap_mock_shops', 'cap_mock_products', 'cap_mock_stock_entries', 'cap_mock_sales', 'cap_mock_stock_history'].forEach(
    (k) => localStorage.removeItem(k)
  );
} catch {
  // Ignore in non-browser envs
}

// Initial Empty Data - No Fake Data
const INITIAL_SHOPS: Shop[] = [];
const INITIAL_PRODUCTS: Product[] = [];
const INITIAL_STOCK_ENTRIES: StockEntry[] = [];
const INITIAL_SALES: Sale[] = [];
const INITIAL_STOCK_HISTORY: StockHistoryItem[] = [];

// Helper to load & save in localStorage
function getStorage<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(item);
  } catch {
    return initial;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export class MockAdapter {
  private static getShopsData(): Shop[] {
    return getStorage(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
  }

  private static getProductsData(): Product[] {
    return getStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  private static getStockEntriesData(): StockEntry[] {
    return getStorage(STORAGE_KEYS.STOCK_ENTRIES, INITIAL_STOCK_ENTRIES);
  }

  private static getSalesData(): Sale[] {
    return getStorage(STORAGE_KEYS.SALES, INITIAL_SALES);
  }

  private static getStockHistoryData(): StockHistoryItem[] {
    return getStorage(STORAGE_KEYS.STOCK_HISTORY, INITIAL_STOCK_HISTORY);
  }

  // --- Auth ---
  static async login(phone: string, _pass: string): Promise<{ user: User; token: string }> {
    await new Promise((res) => setTimeout(res, 400));
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    // Accept valid 11-digit BD numbers
    if (cleanPhone.length < 11) {
      throw new Error('সঠিক ১১ ডিজিটের ফোন নম্বর লিখুন');
    }

    const user: User = {
      id: 'usr-admin-1',
      name: 'কামাল হোসেন (স্বত্বাধিকারী)',
      phone: cleanPhone,
      role: 'admin',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const token = `cap_mock_jwt_${Date.now()}`;
    return { user, token };
  }

  // --- Shops ---
  static async getShops(): Promise<Shop[]> {
    await new Promise((res) => setTimeout(res, 200));
    return this.getShopsData();
  }

  static async getShopById(shopId: string): Promise<Shop> {
    await new Promise((res) => setTimeout(res, 150));
    const shops = this.getShopsData();
    const shop = shops.find((s) => s.id === shopId);
    if (!shop) {
      throw new Error('দোকানটি খুঁজে পাওয়া যায়নি');
    }
    return shop;
  }

  static async createShop(input: CreateShopInput): Promise<Shop> {
    await new Promise((res) => setTimeout(res, 350));
    const shops = this.getShopsData();
    
    const exists = shops.some((s) => s.name.trim().toLowerCase() === input.name.trim().toLowerCase());
    if (exists) {
      throw new Error('এই নামের দোকান ইতিমধ্যে ডাটাবেজে বিদ্যমান রয়েছে');
    }

    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      name: input.name.trim(),
      code: input.code?.trim().toUpperCase() || `SHP-${shops.length + 1}`,
      address: input.address?.trim() || '',
      phone: input.phone?.trim() || '',
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    shops.push(newShop);
    setStorage(STORAGE_KEYS.SHOPS, shops);
    return newShop;
  }

  // --- Products ---
  static async getProducts(shopId?: string): Promise<Product[]> {
    await new Promise((res) => setTimeout(res, 200));
    const products = this.getProductsData();
    if (shopId && shopId !== 'all') {
      return products.filter((p) => p.shopId === shopId);
    }
    return products;
  }

  // --- Stock Entries ---
  static async getStockEntries(
    shopId?: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<StockEntry>> {
    await new Promise((res) => setTimeout(res, 250));
    let entries = this.getStockEntriesData();
    const shops = this.getShopsData();

    // Map shop name
    entries = entries.map(e => ({
      ...e,
      shopName: shops.find(s => s.id === e.shopId)?.name || e.shopName || 'শাখা',
    }));

    if (shopId && shopId !== 'all') {
      entries = entries.filter((e) => e.shopId === shopId);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.productName.toLowerCase().includes(q) ||
          (e.sku && e.sku.toLowerCase().includes(q)) ||
          e.supplierName.toLowerCase().includes(q)
      );
    }

    if (params.startDate) {
      entries = entries.filter((e) => e.entryDate >= params.startDate!);
    }
    if (params.endDate) {
      entries = entries.filter((e) => e.entryDate <= params.endDate!);
    }

    // Sort latest first
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = entries.length;
    const start = (page - 1) * limit;
    const data = entries.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async createStockEntry(input: CreateStockEntryInput): Promise<StockEntry> {
    await new Promise((res) => setTimeout(res, 400));
    const shops = this.getShopsData();
    const shop = shops.find((s) => s.id === input.shopId);
    if (!shop) throw new Error('দোকান পাওয়া যায়নি');

    const products = this.getProductsData();
    const stockEntries = this.getStockEntriesData();
    const history = this.getStockHistoryData();

    // Find or create product in that shop
    let product = products.find(
      (p) =>
        p.shopId === input.shopId &&
        p.name.trim().toLowerCase() === input.productName.trim().toLowerCase()
    );

    if (!product) {
      product = {
        id: `prod-${Date.now()}`,
        shopId: input.shopId,
        name: input.productName.trim(),
        sku: input.sku?.trim(),
        availableStock: input.quantityReceived,
        buyingRate: input.buyingRate,
        sellingRate: input.sellingRate,
        minStockAlert: 5,
        lastRestockedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      products.push(product);
    } else {
      // Accumulate available stock
      product.availableStock += input.quantityReceived;
      product.buyingRate = input.buyingRate;
      product.sellingRate = input.sellingRate;
      if (input.sku) product.sku = input.sku;
      product.lastRestockedAt = new Date().toISOString();
    }
    setStorage(STORAGE_KEYS.PRODUCTS, products);

    const newStockEntry: StockEntry = {
      id: `stk-${Date.now()}`,
      shopId: input.shopId,
      shopName: shop.name,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantityReceived: input.quantityReceived,
      buyingRate: input.buyingRate,
      sellingRate: input.sellingRate,
      totalPurchaseValue: input.quantityReceived * input.buyingRate,
      supplierName: input.supplierName.trim(),
      entryDate: input.entryDate,
      notes: input.notes?.trim(),
      currentAvailableStock: product.availableStock,
      createdAt: new Date().toISOString(),
    };

    stockEntries.unshift(newStockEntry);
    setStorage(STORAGE_KEYS.STOCK_ENTRIES, stockEntries);

    // Record in history
    const historyItem: StockHistoryItem = {
      id: `his-${Date.now()}`,
      shopId: input.shopId,
      shopName: shop.name,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      movementType: 'STOCK_IN',
      quantityChange: input.quantityReceived,
      resultingBalance: product.availableStock,
      referenceId: newStockEntry.id,
      supplierOrCustomer: input.supplierName.trim(),
      date: input.entryDate,
      notes: input.notes ? `স্টক এন্ট্রি: ${input.notes}` : 'স্টক রিসিভ (ক্রয়)',
    };
    history.unshift(historyItem);
    setStorage(STORAGE_KEYS.STOCK_HISTORY, history);

    return newStockEntry;
  }

  static async updateStockEntry(entryId: string, input: UpdateStockEntryInput): Promise<StockEntry> {
    await new Promise((res) => setTimeout(res, 300));
    const stockEntries = this.getStockEntriesData();
    const index = stockEntries.findIndex((e) => e.id === entryId);
    if (index === -1) throw new Error('স্টক রেকর্ডটি পাওয়া যায়নি');

    const entry = stockEntries[index];
    const products = this.getProductsData();
    const product = products.find((p) => p.id === entry.productId || (p.shopId === entry.shopId && p.name === entry.productName));

    const oldQty = entry.quantityReceived;
    const newQty = input.quantityReceived !== undefined ? input.quantityReceived : oldQty;
    const qtyDelta = newQty - oldQty;

    const newBuyingRate = input.buyingRate !== undefined ? input.buyingRate : entry.buyingRate;
    const newSellingRate = input.sellingRate !== undefined ? input.sellingRate : entry.sellingRate;

    if (product) {
      const updatedStock = product.availableStock + qtyDelta;
      if (updatedStock < 0) {
        throw new Error('স্টক এন্ট্রির পরিমাণ ইতিমধ্যে ব্যবহৃত বিক্রয়ের চেয়ে কম করা সম্ভব নয়');
      }
      product.availableStock = updatedStock;
      product.buyingRate = newBuyingRate;
      product.sellingRate = newSellingRate;
      if (input.productName) product.name = input.productName.trim();
      if (input.sku !== undefined) product.sku = input.sku.trim();
      setStorage(STORAGE_KEYS.PRODUCTS, products);
    }

    const updatedEntry: StockEntry = {
      ...entry,
      productName: input.productName ? input.productName.trim() : entry.productName,
      sku: input.sku !== undefined ? input.sku.trim() : entry.sku,
      quantityReceived: newQty,
      buyingRate: newBuyingRate,
      sellingRate: newSellingRate,
      totalPurchaseValue: newQty * newBuyingRate,
      supplierName: input.supplierName ? input.supplierName.trim() : entry.supplierName,
      entryDate: input.entryDate || entry.entryDate,
      notes: input.notes !== undefined ? input.notes.trim() : entry.notes,
      currentAvailableStock: product ? product.availableStock : newQty,
    };

    stockEntries[index] = updatedEntry;
    setStorage(STORAGE_KEYS.STOCK_ENTRIES, stockEntries);

    return updatedEntry;
  }

  static async deleteStockEntry(shopId: string, entryId: string): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 250));
    const stockEntries = this.getStockEntriesData();
    const entry = stockEntries.find((e) => e.id === entryId);
    if (!entry) throw new Error('স্টক রেকর্ডটি পাওয়া যায়নি');

    // Deduct stock from product
    const products = this.getProductsData();
    const product = products.find((p) => p.id === entry.productId || (p.shopId === shopId && p.name === entry.productName));
    if (product) {
      product.availableStock = Math.max(0, product.availableStock - entry.quantityReceived);
      setStorage(STORAGE_KEYS.PRODUCTS, products);
    }

    const filtered = stockEntries.filter((e) => e.id !== entryId);
    setStorage(STORAGE_KEYS.STOCK_ENTRIES, filtered);

    // Remove from history
    const history = this.getStockHistoryData();
    const filteredHistory = history.filter((h) => h.referenceId !== entryId);
    setStorage(STORAGE_KEYS.STOCK_HISTORY, filteredHistory);

    return { success: true, message: 'স্টক রেকর্ড সফলভাবে মুছে ফেলা হয়েছে' };
  }


  // --- Sales ---
  static async getSales(
    shopId?: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<Sale>> {
    await new Promise((res) => setTimeout(res, 250));
    let sales = this.getSalesData();
    const shops = this.getShopsData();

    sales = sales.map(s => ({
      ...s,
      shopName: shops.find(shp => shp.id === s.shopId)?.name || s.shopName || 'শাখা',
    }));

    if (shopId && shopId !== 'all') {
      sales = sales.filter((s) => s.shopId === shopId);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      sales = sales.filter(
        (s) =>
          s.productName.toLowerCase().includes(q) ||
          s.invoiceNo.toLowerCase().includes(q) ||
          (s.sku && s.sku.toLowerCase().includes(q)) ||
          (s.customerName && s.customerName.toLowerCase().includes(q))
      );
    }

    if (params.startDate) {
      sales = sales.filter((s) => s.saleDate >= params.startDate!);
    }
    if (params.endDate) {
      sales = sales.filter((s) => s.saleDate <= params.endDate!);
    }

    sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = sales.length;
    const start = (page - 1) * limit;
    const data = sales.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async createSale(input: CreateSaleInput): Promise<Sale> {
    await new Promise((res) => setTimeout(res, 400));
    const shops = this.getShopsData();
    const shop = shops.find((s) => s.id === input.shopId);
    if (!shop) throw new Error('দোকান পাওয়া যায়নি');

    const products = this.getProductsData();
    const sales = this.getSalesData();
    const history = this.getStockHistoryData();

    const product = products.find((p) => p.id === input.productId && p.shopId === input.shopId);
    if (!product) {
      throw new Error('নির্বাচিত পণ্যটি এই দোকানে পাওয়া যায়নি');
    }

    if (product.availableStock < input.quantitySold) {
      throw new Error(
        `পর্যাপ্ত স্টক নেই! এই পণ্যের বর্তমান মজুদ মাত্র ${product.availableStock} পিস`
      );
    }

    // Deduct stock
    product.availableStock -= input.quantitySold;
    setStorage(STORAGE_KEYS.PRODUCTS, products);

    const discount = input.discount || 0;
    const totalSellingPrice = Math.max(0, input.quantitySold * input.sellingRate - discount);
    const costPriceAtSale = input.quantitySold * product.buyingRate;
    const profit = Math.max(0, totalSellingPrice - costPriceAtSale);

    const invoiceCount = sales.length + 1;
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(invoiceCount).padStart(4, '0')}`;

    const newSale: Sale = {
      id: `sal-${Date.now()}`,
      invoiceNo,
      shopId: input.shopId,
      shopName: shop.name,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantitySold: input.quantitySold,
      sellingRate: input.sellingRate,
      discount,
      totalSellingPrice,
      costPriceAtSale,
      profit,
      saleDate: input.saleDate,
      customerName: input.customerName?.trim(),
      customerPhone: input.customerPhone?.trim(),
      notes: input.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    sales.unshift(newSale);
    setStorage(STORAGE_KEYS.SALES, sales);

    // Add to history
    const historyItem: StockHistoryItem = {
      id: `his-${Date.now()}`,
      shopId: input.shopId,
      shopName: shop.name,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      movementType: 'STOCK_OUT',
      quantityChange: -input.quantitySold,
      resultingBalance: product.availableStock,
      referenceId: invoiceNo,
      supplierOrCustomer: input.customerName || 'খুচরা গ্রাহক',
      date: input.saleDate,
      notes: `বিক্রয় ইনভয়েস ${invoiceNo}`,
    };
    history.unshift(historyItem);
    setStorage(STORAGE_KEYS.STOCK_HISTORY, history);

    return newSale;
  }

  static async updateSale(saleId: string, input: UpdateSaleInput): Promise<Sale> {
    await new Promise((res) => setTimeout(res, 300));
    const sales = this.getSalesData();
    const index = sales.findIndex((s) => s.id === saleId);
    if (index === -1) throw new Error('বিক্রয় রেকর্ডটি পাওয়া যায়নি');

    const sale = sales[index];
    const products = this.getProductsData();
    const targetProductId = input.productId || sale.productId;
    const oldProductId = sale.productId;
    const oldQty = sale.quantitySold;
    const newQty = input.quantitySold !== undefined ? input.quantitySold : oldQty;
    const newSellingRate = input.sellingRate !== undefined ? input.sellingRate : sale.sellingRate;
    const discount = input.discount !== undefined ? input.discount : (sale.discount || 0);

    let product = products.find((p) => p.id === targetProductId);
    if (!product) throw new Error('পণ্য পাওয়া যায়নি');

    if (targetProductId !== oldProductId) {
      // Return old quantity to old product
      const oldProduct = products.find((p) => p.id === oldProductId);
      if (oldProduct) {
        oldProduct.availableStock += oldQty;
      }
      if (product.availableStock < newQty) {
        throw new Error(`পর্যাপ্ত স্টক নেই! এই পণ্যের বর্তমান মজুদ ${product.availableStock} পিস`);
      }
      product.availableStock -= newQty;
    } else {
      const qtyDelta = newQty - oldQty;
      if (qtyDelta > 0 && product.availableStock < qtyDelta) {
        throw new Error(`পর্যাপ্ত স্টক নেই! এই পণ্যের অতিরিক্ত ${qtyDelta} পিস মজুদ নেই (বর্তমান মজুদ: ${product.availableStock} পিস)`);
      }
      product.availableStock -= qtyDelta;
    }
    setStorage(STORAGE_KEYS.PRODUCTS, products);

    const totalSellingPrice = Math.max(0, newQty * newSellingRate - discount);
    const costPriceAtSale = newQty * (product.buyingRate || 0);
    const profit = Math.max(0, totalSellingPrice - costPriceAtSale);

    const updatedSale: Sale = {
      ...sale,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantitySold: newQty,
      sellingRate: newSellingRate,
      discount,
      totalSellingPrice,
      costPriceAtSale,
      profit,
      saleDate: input.saleDate || sale.saleDate,
      customerName: input.customerName !== undefined ? input.customerName.trim() : sale.customerName,
      customerPhone: input.customerPhone !== undefined ? input.customerPhone.trim() : sale.customerPhone,
      notes: input.notes !== undefined ? input.notes.trim() : sale.notes,
    };

    sales[index] = updatedSale;
    setStorage(STORAGE_KEYS.SALES, sales);

    return updatedSale;
  }

  static async deleteSale(shopId: string, saleId: string): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 250));
    const sales = this.getSalesData();
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) throw new Error('বিক্রয় রেকর্ডটি পাওয়া যায়নি');

    // Return stock to product
    const products = this.getProductsData();
    const product = products.find((p) => p.id === sale.productId || (p.shopId === shopId && p.name === sale.productName));
    if (product) {
      product.availableStock += sale.quantitySold;
      setStorage(STORAGE_KEYS.PRODUCTS, products);
    }

    const filtered = sales.filter((s) => s.id !== saleId);
    setStorage(STORAGE_KEYS.SALES, filtered);

    // Remove from history
    const history = this.getStockHistoryData();
    const filteredHistory = history.filter((h) => h.referenceId !== sale.invoiceNo && h.referenceId !== saleId);
    setStorage(STORAGE_KEYS.STOCK_HISTORY, filteredHistory);

    return { success: true, message: 'বিক্রয় রেকর্ড সফলভাবে মুছে ফেলা হয়েছে' };
  }


  // --- Stock History ---
  static async getStockHistory(
    shopId?: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<StockHistoryItem>> {
    await new Promise((res) => setTimeout(res, 200));
    let history = this.getStockHistoryData();
    const shops = this.getShopsData();

    history = history.map(h => ({
      ...h,
      shopName: shops.find(s => s.id === h.shopId)?.name || h.shopName || 'শাখা',
    }));

    if (shopId && shopId !== 'all') {
      history = history.filter((h) => h.shopId === shopId);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      history = history.filter(
        (h) =>
          h.productName.toLowerCase().includes(q) ||
          (h.sku && h.sku.toLowerCase().includes(q)) ||
          h.referenceId.toLowerCase().includes(q) ||
          (h.supplierOrCustomer && h.supplierOrCustomer.toLowerCase().includes(q))
      );
    }

    if (params.startDate) {
      history = history.filter((h) => h.date >= params.startDate!);
    }
    if (params.endDate) {
      history = history.filter((h) => h.date <= params.endDate!);
    }

    const page = params.page || 1;
    const limit = params.limit || 15;
    const total = history.length;
    const start = (page - 1) * limit;
    const data = history.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // --- Dashboard KPIs and Charts ---
  static async getDashboardData(
    shopId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    kpis: DashboardKPIs;
    salesTrend: SalesTrendDataPoint[];
    shopDistribution: ShopStockDistribution[];
    lowStockProducts: Product[];
    recentSales: Sale[];
    recentStockEntries: StockEntry[];
  }> {
    await new Promise((res) => setTimeout(res, 300));

    const shops = this.getShopsData();
    const products = this.getProductsData();
    let sales = this.getSalesData();
    let stockEntries = this.getStockEntriesData();

    // Filter by Shop
    const filteredProducts =
      shopId && shopId !== 'all' ? products.filter((p) => p.shopId === shopId) : products;

    if (shopId && shopId !== 'all') {
      sales = sales.filter((s) => s.shopId === shopId);
      stockEntries = stockEntries.filter((s) => s.shopId === shopId);
    }

    // Filter by Date for Sales and Stock Entries
    if (startDate) {
      sales = sales.filter((s) => s.saleDate >= startDate);
      stockEntries = stockEntries.filter((s) => s.entryDate >= startDate);
    }
    if (endDate) {
      sales = sales.filter((s) => s.saleDate <= endDate);
      stockEntries = stockEntries.filter((s) => s.entryDate <= endDate);
    }

    // Calculate Accurate KPIs
    const totalProducts = filteredProducts.length;
    const totalStockUnits = filteredProducts.reduce((sum, p) => sum + (p.availableStock || 0), 0);
    const totalStockValue = filteredProducts.reduce(
      (sum, p) => sum + (p.availableStock || 0) * (p.buyingRate || 0),
      0
    );
    const totalSalesAmount = sales.reduce((sum, s) => sum + (s.totalSellingPrice || 0), 0);
    const grossProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0);

    const lowStockProducts = filteredProducts.filter(
      (p) => p.availableStock <= (p.minStockAlert || 5)
    );

    // Distribution by Shop
    const shopDistribution: ShopStockDistribution[] = shops.map((s) => {
      const shopProds = products.filter((p) => p.shopId === s.id);
      const units = shopProds.reduce((sum, p) => sum + p.availableStock, 0);
      const val = shopProds.reduce((sum, p) => sum + p.availableStock * p.buyingRate, 0);
      return {
        shopId: s.id,
        shopName: s.name,
        totalUnits: units,
        totalStockValue: val,
        percentage: totalStockUnits > 0 ? Math.round((units / totalStockUnits) * 100) : 0,
      };
    });

    // Sales Trend (7 days or weekly points)
    const salesTrendMap: Record<string, { salesAmount: number; unitsSold: number }> = {};
    sales.forEach((s) => {
      const dateKey = s.saleDate;
      if (!salesTrendMap[dateKey]) {
        salesTrendMap[dateKey] = { salesAmount: 0, unitsSold: 0 };
      }
      salesTrendMap[dateKey].salesAmount += s.totalSellingPrice;
      salesTrendMap[dateKey].unitsSold += s.quantitySold;
    });

    let salesTrend: SalesTrendDataPoint[] = Object.entries(salesTrendMap).map(([date, val]) => ({
      date,
      salesAmount: val.salesAmount,
      unitsSold: val.unitsSold,
    }));

    salesTrend.sort((a, b) => a.date.localeCompare(b.date));

    const recentSales = [...sales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const recentStockEntries = [...stockEntries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      kpis: {
        totalProducts,
        totalStockUnits,
        totalStockValue,
        totalSalesAmount,
        grossProfit,
        lowStockCount: lowStockProducts.length,
      },
      salesTrend,
      shopDistribution,
      lowStockProducts,
      recentSales,
      recentStockEntries,
    };
  }
}
