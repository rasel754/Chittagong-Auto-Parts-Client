import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShopStockDistribution } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { Store, PieChart } from 'lucide-react';

interface StockDistributionChartProps {
  data: ShopStockDistribution[];
}

export const StockDistributionChart: React.FC<StockDistributionChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('dashboard.stockDistribution')}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">শাখাভিত্তিক মোট পণ্যের মজুদ শতাংশ</p>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col items-center justify-center min-h-[140px] text-muted-foreground text-xs">
          <p>{t('dashboard.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('dashboard.stockDistribution')}</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">শাখাভিত্তিক মোট পণ্যের মজুদ শতাংশ</p>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {data.map((item, idx) => {
          const colors = [
            'bg-emerald-500',
            'bg-blue-500',
            'bg-amber-500',
            'bg-purple-500',
            'bg-indigo-500',
          ];
          const colorClass = colors[idx % colors.length];

          return (
            <div key={item.shopId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Store className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate max-w-[180px]">{item.shopName}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span>{formatQuantity(item.totalUnits, lang)}</span>
                  <span className="text-muted-foreground">({item.percentage}%)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                  style={{ width: `${Math.max(4, item.percentage)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                <span>মূল্যমান: {formatCurrency(item.totalStockValue, lang)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
