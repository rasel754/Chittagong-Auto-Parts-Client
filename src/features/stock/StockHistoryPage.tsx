import React, { useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api-client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Shop } from '@/types';
import { formatQuantity } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { exportToCsv } from '@/lib/export-csv';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

export const StockHistoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';
  const { shopId } = useParams<{ shopId: string }>();
  const { shops } = useOutletContext<{ shops: Shop[] }>();

  const currentShop = shops.find((s) => s.id === shopId);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['stock-history', shopId, page, search],
    queryFn: () =>
      api.getStockHistory(shopId, {
        page,
        limit: 15,
        search,
      }),
  });

  const history = response?.data || [];
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;

  const handleExportCsv = () => {
    exportToCsv('Stock_Movement_History', history, [
      { key: 'date', label: 'তারিখ (Date)' },
      { key: 'productName', label: 'পণ্য (Product)' },
      { key: 'movementType', label: 'ধরণ (Movement)' },
      { key: 'quantityChange', label: 'পরিমাণ পরিবর্তন (Change)' },
      { key: 'resultingBalance', label: 'পরবর্তী মজুদ (Balance)' },
      { key: 'referenceId', label: 'রেফারেন্স (Ref No)' },
      { key: 'supplierOrCustomer', label: 'সাপ্লায়ার / ক্রেতা (Party)' },
      { key: 'notes', label: 'মন্তব্য (Notes)' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-5 sm:p-6 rounded-2xl border shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" />
            <span>{t('stock.historyTitle')}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {currentShop ? `${currentShop.name} এর ইনভেন্টরি মুভমেন্ট ট্র্যাকার` : 'সকল ইনভেন্টরি ট্রানজেকশন'}
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCsv}
          className="gap-1.5"
          disabled={history.length === 0}
        >
          <Download className="h-4 w-4" />
          <span>{t('sales.exportCsv')}</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-card p-4 rounded-xl border">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="পণ্য, রেফারেন্স নং বা পার্টির নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="space-y-4">
        {history.length === 0 && !isLoading ? (
          <EmptyState
            title="কোনো স্টক মুভমেন্ট রেকর্ড নেই"
            description="এখনো কোনো স্টক আদান-প্রদান রেকর্ড লিপিবদ্ধ হয়নি"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('stock.entryDate')}</TableHead>
                <TableHead>{t('stock.productName')}</TableHead>
                <TableHead>মুভমেন্টের ধরণ</TableHead>
                <TableHead className="text-right">পরিমাণ পরিবর্তন</TableHead>
                <TableHead className="text-right">{t('stock.resultingBalance')}</TableHead>
                <TableHead>রেফারেন্স / চালান</TableHead>
                <TableHead>সাপ্লায়ার / ক্রেতা</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => {
                const isInbound = item.quantityChange > 0;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                      {formatDate(item.date, lang)}
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-xs text-foreground">{item.productName}</p>
                      {item.sku && (
                        <p className="text-[11px] text-muted-foreground font-mono">SKU: {item.sku}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {isInbound ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                          {t('stock.movementIn')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          {t('stock.movementOut')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right text-xs font-bold ${
                        isInbound ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isInbound ? '+' : ''}
                      {formatQuantity(item.quantityChange, lang)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-foreground">
                      {formatQuantity(item.resultingBalance, lang)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.referenceId}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.supplierOrCustomer || '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-3">
            <p className="text-xs text-muted-foreground">
              {t('common.showing')} {history.length} {t('common.of')} {total} {t('common.results')}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-semibold px-2">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
