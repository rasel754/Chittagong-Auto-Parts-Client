import React, { useState } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api-client';
import { KpiGrid } from './components/KpiGrid';
import { SalesTrendChart } from './components/SalesTrendChart';
import { LowStockAlertList } from './components/LowStockAlertList';
import { RecentSalesTable } from './components/RecentSalesTable';
import { RecentStockEntriesTable } from './components/RecentStockEntriesTable';
import { Button } from '@/components/ui/button';
import { StockEntryModal } from '@/features/stock/StockEntryModal';
import { SalesEntryModal } from '@/features/sales/SalesEntryModal';
import { Shop } from '@/types';
import {
  Store,
  Boxes,
  ShoppingCart,
  RefreshCw,
  Phone,
  MapPin,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const ShopDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { shopId } = useParams<{ shopId: string }>();
  const { shops } = useOutletContext<{ shops: Shop[] }>();

  const currentShop = shops.find((s) => s.id === shopId);

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  const getFilterDates = () => {
    const today = new Date();
    if (dateFilter === 'today') {
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
      return { start, end };
    }
    if (dateFilter === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0).toISOString();
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      return { start, end };
    }
    if (dateFilter === 'custom') {
      if (!startDate) return { start: undefined, end: undefined };
      const start = new Date(`${startDate}T00:00:00`).toISOString();
      const end = endDate ? new Date(`${endDate}T23:59:59.999`).toISOString() : new Date().toISOString();
      return { start, end };
    }
    return { start: undefined, end: undefined };
  };

  const { start: effectiveStart, end: effectiveEnd } = getFilterDates();

  const {
    data: dashboardData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard', shopId, effectiveStart, effectiveEnd],
    queryFn: () => api.getDashboardData(shopId, effectiveStart, effectiveEnd),
    enabled: !!shopId,
  });

  if (!currentShop && !isLoading) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border space-y-4">
        <div className="p-3 bg-amber-500/10 text-amber-600 rounded-full inline-block">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">{t('shops.notFound')}</h2>
        <p className="text-xs text-muted-foreground">অনুরোধকৃত দোকানটি সিস্টেমে বিদ্যমান নেই</p>
        <Button asChild variant="outline">
          <Link to="/dashboard">{t('shops.backToDashboard')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shop Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-card p-5 sm:p-6 rounded-2xl border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                {currentShop?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                {currentShop?.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {currentShop.address}
                  </span>
                )}
                {currentShop?.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3.5 w-3.5" />
                    {currentShop.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Quick Date Filter */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
              onClick={() => setDateFilter('custom')}
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
            onClick={() => setIsStockModalOpen(true)}
            variant="outline"
            className="border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
          >
            <Boxes className="h-4 w-4 mr-1.5 text-emerald-600" />
            <span>{t('nav.addStock')}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsSalesModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            <span>{t('nav.recordSale')}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="h-9 px-2.5"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Custom Date Inputs if 'custom' is active */}
      {dateFilter === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">{t('common.startDate')}:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 px-2 rounded-lg border text-xs bg-background text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{t('common.endDate')}:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 px-2 rounded-lg border text-xs bg-background text-foreground"
            />
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      {dashboardData?.kpis && (
        <KpiGrid kpis={dashboardData.kpis} isLoading={isLoading} />
      )}

      {/* Sales Trend & Low Stock alert in this shop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {dashboardData?.salesTrend && (
            <SalesTrendChart data={dashboardData.salesTrend} />
          )}
        </div>
        <div>
          {dashboardData?.lowStockProducts && (
            <LowStockAlertList products={dashboardData.lowStockProducts} />
          )}
        </div>
      </div>

      {/* Recent Sales and Stock Entries for this shop */}
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
        defaultShopId={shopId}
        shops={shops}
      />
      <SalesEntryModal
        open={isSalesModalOpen}
        onOpenChange={setIsSalesModalOpen}
        defaultShopId={shopId}
        shops={shops}
      />
    </div>
  );
};
