import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StockEntry } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { Boxes } from 'lucide-react';

interface RecentStockEntriesTableProps {
  entries: StockEntry[];
}

export const RecentStockEntriesTable: React.FC<RecentStockEntriesTableProps> = ({ entries }) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Boxes className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('dashboard.recentStockEntries')}</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">ইনভেন্টরিতে নতুন যোগ হওয়া মালামালের তালিকা</p>
        </div>
      </CardHeader>

      <CardContent className="pt-2 p-0 sm:p-6 sm:pt-2">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            {t('stock.emptyList')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('stock.entryDate')}</TableHead>
                <TableHead>{t('stock.productName')}</TableHead>
                <TableHead>{t('stock.supplierName')}</TableHead>
                <TableHead className="text-right">{t('stock.quantityReceived')}</TableHead>
                <TableHead className="text-right">{t('stock.buyingRate')}</TableHead>
                <TableHead className="text-right">{t('stock.totalPurchaseValue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                    {formatDate(e.entryDate, lang)}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-xs leading-tight text-foreground">{e.productName}</p>
                    {e.sku && <p className="text-[11px] text-muted-foreground font-mono">SKU: {e.sku}</p>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {e.supplierName}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-foreground">
                    {formatQuantity(e.quantityReceived, lang)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatCurrency(e.buyingRate, lang)}
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold text-foreground">
                    {formatCurrency(e.totalPurchaseValue, lang)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
