import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api-client';
import { KpiGrid } from './components/KpiGrid';
import { SalesTrendChart } from './components/SalesTrendChart';
import { StockDistributionChart } from './components/StockDistributionChart';
import { LowStockAlertList } from './components/LowStockAlertList';
import { RecentSalesTable } from './components/RecentSalesTable';
import { RecentStockEntriesTable } from './components/RecentStockEntriesTable';
import { Button } from '@/components/ui/button';
import { StockEntryModal } from '@/features/stock/StockEntryModal';
import { SalesEntryModal } from '@/features/sales/SalesEntryModal';
import { Shop } from '@/types';
import {
  RefreshCw,
  LayoutDashboard,
  Store,
  Calendar,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { formatDate } from '@/lib/date';

export const CommonDashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';
  const { shops } = useOutletContext<{ shops: Shop[] }>();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month' | 'custom'>('all');
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  // Compute effective dates and period identifier for filters
  const getFilterDates = () => {
    const today = new Date();
    if (dateFilter === 'today') {
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
      return { start, end, period: 'today' };
    }
    if (dateFilter === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0).toISOString();
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      return { start, end, period: 'this_month' };
    }
    if (dateFilter === 'custom') {
      if (!startDate && !endDate) {
        return { start: undefined, end: undefined, period: 'custom' };
      }
      let s = startDate;
      let e = endDate;
      if (s && e && s > e) {
        // Swap start and end if user picked end earlier than start
        [s, e] = [e, s];
      }
      const start = s ? new Date(`${s}T00:00:00`).toISOString() : undefined;
      const end = e
        ? new Date(`${e}T23:59:59.999`).toISOString()
        : new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
      return { start, end, period: 'custom' };
    }
    return { start: undefined, end: undefined, period: 'all_time' };
  };

  const { start: effectiveStart, end: effectiveEnd, period: effectivePeriod } = getFilterDates();

  const {
    data: dashboardData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard', selectedShopFilter, dateFilter, effectiveStart, effectiveEnd],
    queryFn: () => api.getDashboardData(selectedShopFilter, effectiveStart, effectiveEnd, effectivePeriod),
  });

  const handleSelectCustom = () => {
    if (!startDate && !endDate) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      setStartDate(`${y}-${m}-01`);
      setEndDate(`${y}-${m}-${d}`);
    }
    setDateFilter('custom');
  };

  const handleResetCustomDates = () => {
    setStartDate('');
    setEndDate('');
    setDateFilter('all');
  };

  // Human readable active filter description
  const getFilterDescription = () => {
    if (dateFilter === 'today') {
      return `${t('dashboard.today')} (${formatDate(new Date(), lang, { fullMonth: false })})`;
    }
    if (dateFilter === 'month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return `${t('dashboard.thisMonth')} (${formatDate(start, lang, { fullMonth: false })} - ${formatDate(end, lang, { fullMonth: false })})`;
    }
    if (dateFilter === 'custom') {
      if (startDate && endDate) {
        return `${t('dashboard.customRange')} (${formatDate(startDate, lang, { fullMonth: false })} - ${formatDate(endDate, lang, { fullMonth: false })})`;
      }
      if (startDate) {
        return `${t('dashboard.customRange')} (${formatDate(startDate, lang, { fullMonth: false })} থেকে বর্তমান)`;
      }
      return t('dashboard.customRange');
    }
    return t('dashboard.allTime');
  };

  const isInvalidDateRange = !!(startDate && endDate && startDate > endDate);

  return (
    <div className="space-y-6">
      {/* Page Header with Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card p-4 sm:p-6 rounded-2xl border shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span>{t('dashboard.title')}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            সকল শারীরিক শোরুম ও ব্রাঞ্চের ইনভেন্টরি, বিক্রয় এবং রাজস্ব পর্যবেক্ষণ
          </p>
        </div>

        {/* Global Action & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Shop Filter */}
          <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-2.5 py-1.5 border">
            <Store className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedShopFilter}
              onChange={(e) => setSelectedShopFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">{t('nav.allShops')}</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Date Filters */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border text-xs font-medium">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                dateFilter === 'all'
                  ? 'bg-card text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('dashboard.allTime')}
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                dateFilter === 'today'
                  ? 'bg-card text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('dashboard.today')}
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                dateFilter === 'month'
                  ? 'bg-card text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('dashboard.thisMonth')}
            </button>
            <button
              onClick={handleSelectCustom}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                dateFilter === 'custom'
                  ? 'bg-card text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('dashboard.customRange')}
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="h-8 px-2.5"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Custom Date Inputs if 'custom' is active */}
      {dateFilter === 'custom' && (
        <div className="p-4 bg-card rounded-xl border space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">{t('common.startDate')}:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 px-2.5 rounded-lg border text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">{t('common.endDate')}:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 px-2.5 rounded-lg border text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetCustomDates}
              className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>রিসেট</span>
            </Button>
          </div>

          {isInvalidDateRange && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>সতর্কতা: শুরুর তারিখ শেষের তারিখের চেয়ে পরবর্তী হতে পারবে না। ফিল্টারে তারিখ দুটি স্বয়ংক্রিয়ভাবে সমন্বয় করা হবে।</span>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Indicator */}
      <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>সময়কাল: <strong className="text-foreground">{getFilterDescription()}</strong></span>
        </div>
        {dashboardData?.recentSales && (
          <span>ফিল্টার অনুযায়ী প্রাপ্ত বিক্রয়: <strong className="text-foreground">{dashboardData.recentSales.length}</strong> টি</span>
        )}
      </div>

      {/* KPI Cards Grid */}
      {dashboardData?.kpis ? (
        <KpiGrid kpis={dashboardData.kpis} isLoading={isLoading} />
      ) : null}

      {/* Charts Section: Sales Trend & Shop Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {dashboardData?.salesTrend && (
            <SalesTrendChart data={dashboardData.salesTrend} />
          )}
        </div>
        <div>
          {dashboardData?.shopDistribution && (
            <StockDistributionChart data={dashboardData.shopDistribution} />
          )}
        </div>
      </div>

      {/* Low Stock Alerts Banner / List */}
      {dashboardData?.lowStockProducts && (
        <LowStockAlertList products={dashboardData.lowStockProducts} />
      )}

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardData?.recentSales && (
          <RecentSalesTable sales={dashboardData.recentSales} />
        )}
        {dashboardData?.recentStockEntries && (
          <RecentStockEntriesTable entries={dashboardData.recentStockEntries} />
        )}
      </div>

      {/* Modals */}
      <StockEntryModal
        open={isStockModalOpen}
        onOpenChange={setIsStockModalOpen}
        defaultShopId={shops[0]?.id}
        shops={shops}
      />
      <SalesEntryModal
        open={isSalesModalOpen}
        onOpenChange={setIsSalesModalOpen}
        defaultShopId={shops[0]?.id}
        shops={shops}
      />
    </div>
  );
};
