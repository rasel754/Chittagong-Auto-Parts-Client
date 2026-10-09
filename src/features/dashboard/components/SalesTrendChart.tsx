import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SalesTrendDataPoint } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { TrendingUp } from 'lucide-react';

interface SalesTrendChartProps {
  data: SalesTrendDataPoint[];
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';

  const chartData = data.map((d) => ({
    ...d,
    formattedDate: formatDate(d.date, lang, { fullMonth: false }),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border bg-card p-3 shadow-xl text-xs space-y-1">
          <p className="font-semibold text-foreground">{item.formattedDate}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold">
            {t('dashboard.salesAmount')}: {formatCurrency(item.salesAmount, lang)}
          </p>
          <p className="text-muted-foreground">
            {t('dashboard.unitsSold')}: {formatQuantity(item.unitsSold, lang)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>{t('dashboard.salesTrend')}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">দিনভিত্তিক বিক্রয় ও পণ্যের গতিপ্রকৃতি</p>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col items-center justify-center min-h-[220px] text-muted-foreground text-xs space-y-1">
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
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>{t('dashboard.salesTrend')}</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">দিনভিত্তিক বিক্রয় ও পণ্যের গতিপ্রকৃতি</p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15803d" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#15803d" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="formattedDate"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `৳${val > 999 ? `${Math.round(val / 1000)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="salesAmount"
                stroke="#15803d"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
