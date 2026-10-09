import React, { useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sale, Shop } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { History, Eye, User, ShoppingBag, Clock } from 'lucide-react';
import { SaleDetailModal } from './SaleDetailModal';
import { EmptyState } from '@/components/common/EmptyState';

export const RecentSalesHistoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';
  const { shopId } = useParams<{ shopId: string }>();
  const { shops } = useOutletContext<{ shops: Shop[] }>();

  const currentShop = shops.find((s) => s.id === shopId);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['sales-history', shopId],
    queryFn: () => api.getSales(shopId, { limit: 50 }),
  });

  const sales = response?.data || [];

  return (
    <div className="space-y-6">
      <div className="bg-card p-5 sm:p-6 rounded-2xl border shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <span>{t('nav.recentSalesHistory')}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {currentShop ? `${currentShop.name} এর সাম্প্রতিক বিক্রয় টাইমলাইন` : 'সাম্প্রতিক সকল বিক্রয়'}
        </p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0 sm:p-6">
          {sales.length === 0 && !isLoading ? (
            <EmptyState
              title={t('sales.emptySales')}
              description="এখনো কোনো বিক্রয় ইতিহাস নেই"
            />
          ) : (
            <div className="divide-y">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {sale.productName}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {sale.invoiceNo}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          {formatQuantity(sale.quantitySold, lang)} × {formatCurrency(sale.sellingRate, lang)}
                        </span>
                        {sale.customerName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-primary" />
                            {sale.customerName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(sale.createdAt || sale.saleDate, lang, { includeTime: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-11 sm:pl-0">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(sale.totalSellingPrice, lang)}
                      </p>
                      {sale.discount ? (
                        <p className="text-[10px] text-destructive">
                          ছাড়: {formatCurrency(sale.discount, lang)}
                        </p>
                      ) : null}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSale(sale)}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{t('common.view')}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SaleDetailModal
        sale={selectedSale}
        open={!!selectedSale}
        onOpenChange={(open) => !open && setSelectedSale(null)}
      />
    </div>
  );
};
