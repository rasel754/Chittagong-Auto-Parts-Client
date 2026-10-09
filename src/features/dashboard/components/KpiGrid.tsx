import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatsCard } from '@/components/common/StatsCard';
import { DashboardKPIs } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { formatLocalizedNumber } from '@/lib/number';
import {
  PackageCheck,
  Boxes,
  CircleDollarSign,
  TrendingUp,
  Coins,
} from 'lucide-react';

interface KpiGridProps {
  kpis: DashboardKPIs;
  isLoading?: boolean;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
      {/* 1. Total Products */}
      <StatsCard
        title={t('dashboard.totalProducts')}
        value={formatLocalizedNumber(kpis.totalProducts, lang)}
        subtitle="তালিকায় থাকা মোট ভিন্ন পণ্য"
        icon={PackageCheck}
        variant="default"
      />

      {/* 2. Total Stock (Units) */}
      <StatsCard
        title={t('dashboard.totalStockUnits')}
        value={formatQuantity(kpis.totalStockUnits, lang)}
        subtitle="দোকানে বিদ্যমান মোট মজুদ"
        icon={Boxes}
        variant="blue"
      />

      {/* 3. Total Stock Value (Cost) */}
      <StatsCard
        title={t('dashboard.totalStockValue')}
        value={formatCurrency(kpis.totalStockValue, lang)}
        subtitle="ক্রয়মূল্যের ভিত্তিতে ইনভেন্টরি মূল্য"
        icon={CircleDollarSign}
        variant="amber"
      />

      {/* 4. Total Sales Money */}
      <StatsCard
        title={t('dashboard.totalSalesMoney')}
        value={formatCurrency(kpis.totalSalesAmount, lang)}
        subtitle="গ্রস বিক্রয় আয় (বিক্রিত মূল্য)"
        icon={Coins}
        variant="primary"
      />

      {/* 5. Revenue / Estimated Profit */}
      <StatsCard
        title={t('dashboard.revenueProfit')}
        value={formatCurrency(kpis.grossProfit || 0, lang)}
        subtitle={t('dashboard.profitNote')}
        icon={TrendingUp}
        variant="purple"
      />
    </div>
  );
};
