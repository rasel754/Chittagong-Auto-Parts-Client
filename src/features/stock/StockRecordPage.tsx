import React, { useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api-client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Shop, StockEntry } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { exportToCsv } from '@/lib/export-csv';
import { toast } from '@/components/ui/toast';
import {
  Boxes,
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Truck,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';
import { StockEntryModal } from './StockEntryModal';
import { StockDetailModal } from './StockDetailModal';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ActionMenu } from '@/components/ui/dropdown-menu';

export const StockRecordPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';
  const queryClient = useQueryClient();
  const { shopId } = useParams<{ shopId: string }>();
  const { shops } = useOutletContext<{ shops: Shop[] }>();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<StockEntry | null>(null);
  const [selectedStockDetail, setSelectedStockDetail] = useState<StockEntry | null>(null);

  const currentShop = shops.find((s) => s.id === shopId);

  const deleteMutation = useMutation({
    mutationFn: (entry: StockEntry) => api.deleteStockEntry(entry.shopId, entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success(t('stock.deleteSuccess'));
      setDeletingEntry(null);
    },
    onError: (err: any) => {
      toast.error(t('common.errorOccurred'), err.message || 'স্টক রেকর্ড মোছা যায়নি');
      setDeletingEntry(null);
    },
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ['stock', shopId, page, search, startDate, endDate],
    queryFn: () =>
      api.getStockEntries(shopId, {
        page,
        limit: 10,
        search,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const entries = response?.data || [];
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;

  const handleExportCsv = () => {
    exportToCsv('Stock_Records', entries, [
      { key: 'entryDate', label: 'প্রাপ্তির তারিখ (Entry Date)' },
      { key: 'productName', label: 'পণ্যের নাম (Product)' },
      { key: 'sku', label: 'SKU' },
      { key: 'supplierName', label: 'সাপ্লায়ার (Supplier)' },
      { key: 'quantityReceived', label: 'প্রাপ্ত পরিমাণ (Qty pcs)', formatter: (v) => `${v}` },
      { key: 'buyingRate', label: 'ক্রয়দর (Buying Rate ৳)', formatter: (v) => `${v}` },
      { key: 'sellingRate', label: 'বিক্রয়দর (Selling Rate ৳)', formatter: (v) => `${v}` },
      { key: 'totalPurchaseValue', label: 'মোট ক্রয়মূল্য (Total Value ৳)', formatter: (v) => `${v}` },
      { key: 'currentAvailableStock', label: 'বর্তমান মজুদ (Current Stock)', formatter: (v) => `${v || ''}` },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-5 sm:p-6 rounded-2xl border shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" />
            <span>{t('stock.title')}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {currentShop ? `${currentShop.name} এর ইনভেন্টরি ও মালামাল প্রাপ্তির রেকর্ড` : 'সকল শাখার স্টক রেকর্ড'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="gap-1.5"
            disabled={entries.length === 0}
          >
            <Download className="h-4 w-4" />
            <span>{t('sales.exportCsv')}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsStockModalOpen(true)}
            className="gap-1.5 bg-primary text-white"
          >
            <Plus className="h-4 w-4" />
            <span>{t('nav.addStock')}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-card p-4 rounded-xl border">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="পণ্য, SKU বা সাপ্লায়ার দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">{t('common.startDate')}:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 px-2 rounded-lg border bg-background text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">{t('common.endDate')}:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 px-2 rounded-lg border bg-background text-xs"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="space-y-4">
        {entries.length === 0 && !isLoading ? (
          <EmptyState
            title={t('stock.emptyList')}
            description="কোনো স্টক রেকর্ড খুঁজে পাওয়া যায়নি। নতুন পণ্য স্টক করতে উপরের বোতাম চাপুন।"
            actionLabel={t('nav.addStock')}
            onAction={() => setIsStockModalOpen(true)}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('stock.entryDate')}</TableHead>
                <TableHead>{t('stock.productName')}</TableHead>
                <TableHead>{t('stock.supplierName')}</TableHead>
                <TableHead className="text-right">{t('stock.quantityReceived')}</TableHead>
                <TableHead className="text-right">{t('stock.buyingRate')}</TableHead>
                <TableHead className="text-right">{t('stock.sellingRate')}</TableHead>
                <TableHead className="text-right">{t('stock.totalPurchaseValue')}</TableHead>
                <TableHead className="text-right">{t('stock.currentAvailable')}</TableHead>
                <TableHead className="text-center">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                    {formatDate(e.entryDate, lang)}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-xs text-foreground">{e.productName}</p>
                    {e.sku && (
                      <p className="text-[11px] text-muted-foreground font-mono">SKU: {e.sku}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3 text-muted-foreground" />
                      {e.supplierName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold text-foreground">
                    {formatQuantity(e.quantityReceived, lang)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatCurrency(e.buyingRate, lang)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatCurrency(e.sellingRate, lang)}
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold text-foreground">
                    {formatCurrency(e.totalPurchaseValue, lang)}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold">
                    {e.currentAvailableStock !== undefined ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {formatQuantity(e.currentAvailableStock, lang)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <ActionMenu
                      items={[
                        {
                          label: t('common.view'),
                          icon: <Eye className="h-3.5 w-3.5 text-primary" />,
                          onClick: () => setSelectedStockDetail(e),
                        },
                        {
                          label: t('common.edit'),
                          icon: <Edit3 className="h-3.5 w-3.5 text-blue-500" />,
                          onClick: () => {
                            setEditingEntry(e);
                            setIsStockModalOpen(true);
                          },
                        },
                        {
                          label: t('common.delete'),
                          icon: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
                          variant: 'destructive',
                          onClick: () => setDeletingEntry(e),
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-3">
            <p className="text-xs text-muted-foreground">
              {t('common.showing')} {entries.length} {t('common.of')} {total} {t('common.results')}
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

      <StockEntryModal
        open={isStockModalOpen}
        onOpenChange={(open) => {
          setIsStockModalOpen(open);
          if (!open) setEditingEntry(null);
        }}
        defaultShopId={shopId}
        shops={shops}
        initialData={editingEntry}
      />

      <StockDetailModal
        entry={selectedStockDetail}
        open={!!selectedStockDetail}
        onOpenChange={(open) => !open && setSelectedStockDetail(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!deletingEntry}
        onOpenChange={(open) => !open && setDeletingEntry(null)}
        title={t('stock.deleteTitle')}
        description={
          deletingEntry
            ? `${deletingEntry.productName} (${formatQuantity(deletingEntry.quantityReceived, lang)}) - ${t('stock.deleteConfirm')}`
            : ''
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
        onConfirm={() => deletingEntry && deleteMutation.mutate(deletingEntry)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
