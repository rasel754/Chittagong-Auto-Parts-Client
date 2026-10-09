# চট্টগ্রাম অটো পার্টস — ইনভেন্টরি ও সাপ্লাই ট্র্যাকার (Chittagong Auto Parts Client)

**Chittagong Auto Parts Inventory & Supply Tracker** হলো বাংলাদেশের একাধিক শারীরিক অটো পার্টস শোরুম ও ব্রাঞ্চের ইনভেন্টরি, পণ্য প্রাপ্তি (Stock Entry), খুচরা ও পাইকারি বিক্রয় (Sales Entry), এবং রাজস্ব ট্র্যাক করার একটি আধুনিক ও পূর্ণাঙ্গ ফ্রন্টএন্ড ওয়েব অ্যাপ্লিকেশন।

---

## ১. প্রধান বৈশিষ্ঠ্যসমূহ (Key Features)

- **মাল্টি-শপ আর্কিটেকচার (Multi-Shop Hierarchy)**:
  - **সার্বিক ড্যাশবোর্ড (Common Dashboard)**: সকল ব্রাঞ্চের সম্মিলিত পণ্য, মজুদ, স্টকের মূল্যমান, সর্বমোট বিক্রয় এবং আনুমানিক মোট মুনাফা।
  - **শাখাভিত্তিক ড্যাশবোর্ড (Individual Shop Dashboard)**: চট্টগ্রাম, ঢাকা কিংবা ভবিষ্যতে যোগ হওয়া যেকোনো নতুন শাখার নিজস্ব ড্যাশবোর্ড।
  - **ডায়নামিক শপ যোগকরণ (Dynamic Shop Creation)**: কোড পরিবর্তন ছাড়াই সরাসরি UI থেকে নতুন দোকান যোগ করা যায় এবং তাৎক্ষণিক সাইডবারে যুক্ত হয়।
- **স্টক ও মালামাল এন্ট্রি (Product & Stock Entry)**:
  - শাখাভিত্তিক স্টক গ্রহণ, পণ্যের নাম, SKU/কোড, প্রাপ্তির পরিমাণ (পিস/pcs)।
  - প্রতি পিসের ক্রয়মূল্য (৳) ও বিক্রয়মূল্য (৳) নির্ধারণ।
  - **রিয়েল-টাইম ক্রয়মূল্য গণনা**: `প্রাপ্ত পরিমাণ × ক্রয়মূল্য = মোট ক্রয়মূল্য (৳)` সরাসরি প্রদর্শন।
  - ম্যানুয়াল সাপ্লায়ারের নাম এন্ট্রি ও চালান নোট।
  - সাবমিশনের পূর্বে নিশ্চিতকরণ ডায়ালগ (Confirmation Modal)।
- **বিক্রয় এন্ট্রি ও ইনভয়েসিং (Sales Entry & Invoicing)**:
  - সংশ্লিষ্ট দোকানে বিদ্যমান পণ্যের তালিকা ও **রিয়েল-টাইম মজুদ সংখ্যা (Available Stock)** প্রদর্শন।
  - মজুদ পরিমাণের অতিরিক্ত বিক্রয় রোধ করার স্বয়ংক্রিয় ভ্যালিডেশন।
  - ডিসকাউন্ট/ছাড় এবং সর্বমোট বিক্রয়মূল্য ক্যালকুলেশন।
  - স্বয়ংক্রিয় ইনভয়েস নং জেনারেশন (`INV-YYYY-XXXX`) এবং প্রিন্টযোগ্য ক্যাশ মেমো / রসিদ ভিউয়ার।
- **রেকর্ড ও ইতিহাস ট্র্যাকিং (Records & Movement History)**:
  - বিক্রয় রেকর্ড এবং স্টক রেকর্ডের পেজিনেশন, সার্চ এবং তারিখ ফিল্টারিং।
  - **স্টক মুভমেন্ট ইতিহাস (Stock Movement History)**: ইনবাউন্ড ক্রয় (`STOCK_IN`) এবং আউটবাউন্ড বিক্রয় (`STOCK_OUT`) এর পরিবর্তন এবং পরবর্তী মজুদ ব্যালেন্স ট্র্যাকিং।
  - **CSV এক্সপোর্ট**: বাংলা ফন্ট ও মাইক্রোসফট এক্সেল সমর্থিত UTF-8 BOM সহ ডেটা এক্সপোর্ট।
- **দ্বিভাষিক লোকালাইজেশন (Bangla-English Localization)**:
  - ডিফল্ট ভাষা: **বাংলা**।
  - তাৎক্ষণিক ভাষা পরিবর্তন বোতাম (বাংলা ⇄ English)।
  - বাংলাদেশি টাকা ফরম্যাটিং (`৳ ১,৫০,০০০` / `৳ 150,000`) এবং বাংলা/ইংরেজি উভয় ডিজিটে ইনপুট গ্রহণের সুবিধা।
- **নিরাপদ প্রমাণীকরণ (Authentication)**:
  - শুধুমাত্র ১১ ডিজিটের বাংলাদেশি ফোন নম্বর ও পাসওয়ার্ড ভিত্তিক লগইন (অপ্রয়োজনীয় ইমেইল বা রেজিস্ট্রেশন ছাড়া)।
  - সংরক্ষিত সেশন এবং প্রোটেক্টেড রাউটিং।

---

## ২. প্রযুক্তি ও লাইব্রেরি (Tech Stack)

| উপাদান | প্রযুক্তি |
|---|---|
| Framework | **React 18 + TypeScript** |
| Build Tool | **Vite 6** |
| Styling | **Tailwind CSS + PostCSS** |
| Design System | **Custom Shadcn/UI Design Tokens & Primitives** |
| Server State & Caching | **TanStack Query (React Query v5)** |
| Form Validation | **React Hook Form + Zod** |
| HTTP Client | **Axios (with JWT Interceptors)** |
| Client State | **Zustand** |
| Data Visualization | **Recharts** |
| Icons | **Lucide React** |
| Localization | **i18next + react-i18next** |

---

## ৩. প্রজেক্টের গঠন (Project Structure)

```
src/
├── app/
├── components/
│   ├── common/
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LanguageToggle.tsx
│   │   └── StatsCard.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopNavbar.tsx
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── skeleton.tsx
│       ├── table.tsx
│       └── toast.tsx
├── features/
│   ├── auth/
│   │   ├── authService.ts
│   │   ├── authStore.ts
│   │   ├── LoginPage.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/
│   │   ├── CommonDashboardPage.tsx
│   │   ├── ShopDashboardPage.tsx
│   │   └── components/
│   │       ├── KpiGrid.tsx
│   │       ├── LowStockAlertList.tsx
│   │       ├── RecentSalesTable.tsx
│   │       ├── RecentStockEntriesTable.tsx
│   │       ├── SalesTrendChart.tsx
│   │       └── StockDistributionChart.tsx
│   ├── sales/
│   │   ├── RecentSalesHistoryPage.tsx
│   │   ├── SaleDetailModal.tsx
│   │   ├── SalesEntryModal.tsx
│   │   └── SalesRecordPage.tsx
│   ├── shops/
│   │   ├── CreateShopModal.tsx
│   │   ├── CreateShopPage.tsx
│   │   └── shopStore.ts
│   └── stock/
│       ├── StockEntryModal.tsx
│       ├── StockHistoryPage.tsx
│       └── StockRecordPage.tsx
├── lib/
│   ├── api-client.ts
│   ├── currency.ts
│   ├── date.ts
│   ├── export-csv.ts
│   ├── mock-adapter.ts
│   ├── number.ts
│   └── utils.ts
├── locales/
│   ├── bn.ts
│   ├── en.ts
│   └── i18n.ts
├── types/
│   └── index.ts
├── App.tsx
├── index.css
└── main.tsx
```

---

## ৪. এনভায়রনমেন্ট ভেরিয়েবল (.env)

প্রজেক্ট রুট ফোল্ডারে `.env` ফাইলে নিম্নলিখিত ভেরিয়েবলগুলো কনফিগার করা যায়:

```bash
# রিয়েল ব্যাকএন্ড API এর বেস URL
VITE_API_BASE_URL=http://localhost:5000/api

# মক এডাপ্টার মোড:
# true = লোকালস্টোরেজে ডেটা সংরক্ষণ করে সম্পূর্ণ ফিচার টেস্ট করার মোড (ব্যাকএন্ড চালু না থাকলেও চলবে)
# false = সরাসরি ব্যাকএন্ড সার্ভার API তে রিকোয়েস্ট পাঠাবে
VITE_USE_MOCK=true
```

---

## ৫. ব্যাকএন্ড API এন্ডপয়েন্ট চুক্তি (Expected Backend API Contracts)

ফ্রন্টএন্ড সেন্ট্রালাইজড `api-client.ts` এর মাধ্যমে নিম্নের REST এন্ডপয়েন্টগুলোর সাথে সরাসরি যোগাযোগ করে:

### Authentication
- `POST /api/auth/login`
  - Body: `{ phone: string, password: string }`
  - Response: `{ user: { id, name, phone, role }, token: string }`

### Shops
- `GET /api/shops` → সকল দোকানের অ্যারে `Shop[]`
- `GET /api/shops/:shopId` → নির্দিষ্ট দোকানের তথ্য `Shop`
- `POST /api/shops` → নতুন দোকান তৈরি
  - Body: `{ name: string, code?: string, address?: string, phone?: string }`

### Products & Inventory
- `GET /api/products?shopId=:shopId` → পণ্যের তালিকা ও মজুদ সংখ্যা `Product[]`

### Stock Entries
- `GET /api/stock/entries?shopId=:shopId&page=1&limit=10&search=&startDate=&endDate=` → পেজিনেটেড স্টক রেকর্ড
- `POST /api/stock/entries` → নতুন স্টক এন্ট্রি
  - Body: `{ shopId, productName, sku, quantityReceived, buyingRate, sellingRate, supplierName, entryDate, notes }`

### Sales & Invoicing
- `GET /api/sales?shopId=:shopId&page=1&limit=10&search=&startDate=&endDate=` → পেজিনেটেড বিক্রয় রেকর্ড
- `POST /api/sales` → বিক্রয় সম্পন্নকরণ
  - Body: `{ shopId, productId, quantitySold, sellingRate, discount, saleDate, customerName, customerPhone, notes }`

### Stock History (Movements)
- `GET /api/stock/history?shopId=:shopId&page=1&limit=15&search=` → স্টক মুভমেন্ট তালিকা

### Dashboard Metrics
- `GET /api/dashboard?shopId=:shopId&startDate=&endDate=` → ড্যাশবোর্ড পরিসংখ্যান (KPIs, Sales Trend, Stock Distribution, Low Stock Alerts)

---

## ৬. ইন্সটলেশন ও রান করার নিয়ম (Installation & Run Commands)

### ডিপেন্ডেন্সি ইন্সটল:
```bash
npm install
```

### লোকাল ডেভেলপমেন্ট সার্ভার চালু:
```bash
npm run dev
```
ব্রাউজারে খুলুন: `http://localhost:5173`

### প্রোডাকশন বিল্ড ও টাইপচেক:
```bash
npm run build
```

---

## ৭. ডিফল্ট লগইন ক্রিডেনশিয়াল (Demo Credentials)

মক মোডে টেস্ট করার জন্য:
- **ফোন নম্বর**: `01711223344` (অথবা যেকোনো ১১ ডিজিটের বিডি নম্বর)
- **পাসওয়ার্ড**: `admin`
