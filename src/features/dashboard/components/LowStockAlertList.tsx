import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { formatQuantity, formatCurrency } from '@/lib/currency';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LowStockAlertListProps {
  products: Product[];
  onRestockClick?: (product: Product) => void;
}

export const LowStockAlertList: React.FC<LowStockAlertListProps> = ({ products }) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>{t('dashboard.lowStockAlerts')}</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">সতর্কসীমার নিচে নেমে যাওয়া পণ্যের তালিকা</p>
        </div>
        {products.length > 0 && (
          <Badge variant="destructive" className="font-mono">
            {products.length}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-foreground">{t('dashboard.noLowStock')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">সব পণ্যের পর্যাপ্ত স্টক সক্রিয় আছে</p>
          </div>
        ) : (
          <div className="divide-y">
            {products.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {p.sku || 'SKU নেই'} • বিক্রয়: {formatCurrency(p.sellingRate, lang)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    মজুদ: {formatQuantity(p.availableStock, lang)}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    সতর্কসীমা: {p.minStockAlert || 5} পিস
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
