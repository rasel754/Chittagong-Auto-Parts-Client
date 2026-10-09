import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Sale } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { Receipt, Eye } from 'lucide-react';
import { SaleDetailModal } from '@/features/sales/SaleDetailModal';
import { Button } from '@/components/ui/button';

interface RecentSalesTableProps {
  sales: Sale[];
}

export const RecentSalesTable: React.FC<RecentSalesTableProps> = ({ sales }) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <span>{t('dashboard.recentSales')}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">সর্বশেষ সম্পন্ন হওয়া বিক্রয় রেকর্ডসমূহ</p>
          </div>
        </CardHeader>

        <CardContent className="pt-2 p-0 sm:p-6 sm:pt-2">
          {sales.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              {t('sales.emptySales')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sales.invoiceNo')}</TableHead>
                  <TableHead>{t('stock.productName')}</TableHead>
                  <TableHead className="text-right">{t('sales.quantitySold')}</TableHead>
                  <TableHead className="text-right">{t('sales.totalSellingPrice')}</TableHead>
                  <TableHead className="text-right">{t('sales.saleDate')}</TableHead>
                  <TableHead className="text-center">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {s.invoiceNo}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-xs leading-tight">{s.productName}</p>
                      {s.customerName && (
                        <p className="text-[11px] text-muted-foreground">ক্রেতা: {s.customerName}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold">
                      {formatQuantity(s.quantitySold, lang)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(s.totalSellingPrice, lang)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(s.saleDate, lang)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => setSelectedSale(s)}
                        title={t('sales.saleDetails')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SaleDetailModal
        sale={selectedSale}
        open={!!selectedSale}
        onOpenChange={(open) => !open && setSelectedSale(null)}
      />
    </>
  );
};
