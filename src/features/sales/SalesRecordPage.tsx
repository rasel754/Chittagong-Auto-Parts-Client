import React, { useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api-client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Sale, Shop } from '@/types';
import { formatCurrency, formatQuantity } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { exportToCsv } from '@/lib/export-csv';
import { toast } from '@/components/ui/toast';
import {
  Receipt,
  Search,
  Download,
  Plus,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SalesEntryModal } from './SalesEntryModal';
import { SaleDetailModal } from './SaleDetailModal';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ActionMenu } from '@/components/ui/dropdown-menu';

export const SalesRecordPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';
  const queryClient = useQueryClient();
  const { shopId } = useParams<{ shopId: string }>();
  const { shops } = useOutletContext<{ shops: Shop[] }>();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);

  const currentShop = shops.find((s) => s.id === shopId);

  const deleteMutation = useMutation({
    mutationFn: (sale: Sale) => api.deleteSale(sale.shopId, sale.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success(t('sales.deleteSuccess'));
      setDeletingSale(null);
    },
    onError: (err: any) => {
      toast.error(t('common.errorOccurred'), err.message || 'বিক্রয় রেকর্ড মোছা যায়নি');
      setDeletingSale(null);
    },
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ['sales', shopId, page, search, startDate, endDate],
    queryFn: () =>
      api.getSales(shopId, {
        page,
        limit: 10,
        search,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const sales = response?.data || [];
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;

  const handleExportCsv = () => {
    exportToCsv('Sales_Record', sales, [
      { key: 'invoiceNo', label: 'চালান নং (Invoice No)' },
      { key: 'productName', label: 'পণ্যের নাম (Product)' },
      { key: 'sku', label: 'SKU' },
      { key: 'quantitySold', label: 'বিক্রিত পরিমাণ (Qty pcs)', formatter: (v) => `${v}` },
      { key: 'sellingRate', label: 'দর (Rate ৳)', formatter: (v) => `${v}` },
      { key: 'discount', label: 'ছাড় (Discount ৳)', formatter: (v) => `${v || 0}` },
      { key: 'totalSellingPrice', label: 'মোট মূল্য (Total ৳)', formatter: (v) => `${v}` },
      { key: 'customerName', label: 'ক্রেতা (Customer)' },
      { key: 'saleDate', label: 'তারিখ (Date)' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-5 sm:p-6 rounded-2xl border shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            <span>{t('sales.title')}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {currentShop ? `${currentShop.name} এর সকল বিক্রয় লেনদেন` : 'সকল বিক্রয় চালান'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="gap-1.5"
            disabled={sales.length === 0}
          >
            <Download className="h-4 w-4" />
            <span>{t('sales.exportCsv')}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsSalesModalOpen(true)}
            className="gap-1.5 bg-primary text-white"
          >
            <Plus className="h-4 w-4" />
            <span>{t('nav.recordSale')}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-card p-4 rounded-xl border">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
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

      {/* Sales Table */}
      <div className="space-y-4">
        {sales.length === 0 && !isLoading ? (
          <EmptyState
            title={t('sales.emptySales')}
            description="কোনো বিক্রয় রেকর্ড পাওয়া যায়নি। নতুন বিক্রয় রেকর্ড করতে উপরের বোতাম চাপুন।"
            actionLabel={t('nav.recordSale')}
            onAction={() => setIsSalesModalOpen(true)}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('sales.invoiceNo')}</TableHead>
                <TableHead>{t('stock.productName')}</TableHead>
                <TableHead>{t('sales.customerName')}</TableHead>
                <TableHead className="text-right">{t('sales.quantitySold')}</TableHead>
                <TableHead className="text-right">{t('sales.sellingRate')}</TableHead>
                <TableHead className="text-right">{t('sales.discount')}</TableHead>
                <TableHead className="text-right">{t('sales.totalSellingPrice')}</TableHead>
                <TableHead className="text-right">{t('sales.saleDate')}</TableHead>
                <TableHead className="text-center">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {sale.invoiceNo}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-xs text-foreground">{sale.productName}</p>
                    {sale.sku && (
                      <p className="text-[11px] text-muted-foreground font-mono">SKU: {sale.sku}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {sale.customerName ? (
                      <div>
                        <p className="text-foreground">{sale.customerName}</p>
                        {sale.customerPhone && (
                          <p className="text-[10px] font-mono">{sale.customerPhone}</p>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold text-foreground">
                    {formatQuantity(sale.quantitySold, lang)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatCurrency(sale.sellingRate, lang)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-rose-500">
                    {sale.discount ? `- ${formatCurrency(sale.discount, lang)}` : '০'}
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(sale.totalSellingPrice, lang)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatDate(sale.saleDate, lang)}
                  </TableCell>
                  <TableCell className="text-center">
                    <ActionMenu
                      items={[
                        {
                          label: t('common.view'),
                          icon: <Eye className="h-3.5 w-3.5 text-primary" />,
                          onClick: () => setSelectedSale(sale),
                        },
                        {
                          label: t('common.edit'),
                          icon: <Edit3 className="h-3.5 w-3.5 text-blue-500" />,
                          onClick: () => {
                            setEditingSale(sale);
                            setIsSalesModalOpen(true);
                          },
                        },
                        {
                          label: t('common.delete'),
                          icon: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
                          variant: 'destructive',
                          onClick: () => setDeletingSale(sale),
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
              {t('common.showing')} {sales.length} {t('common.of')} {total} {t('common.results')}
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

      {/* Modals */}
      <SalesEntryModal
        open={isSalesModalOpen}
        onOpenChange={(open) => {
          setIsSalesModalOpen(open);
          if (!open) setEditingSale(null);
        }}
        defaultShopId={shopId}
        shops={shops}
        initialData={editingSale}
      />
      <SaleDetailModal
        sale={selectedSale}
        open={!!selectedSale}
        onOpenChange={(open) => !open && setSelectedSale(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!deletingSale}
        onOpenChange={(open) => !open && setDeletingSale(null)}
        title={t('sales.deleteTitle')}
        description={
          deletingSale
            ? `${deletingSale.invoiceNo} - ${deletingSale.productName} (${formatQuantity(deletingSale.quantitySold, lang)}) - ${t('sales.deleteConfirm')}`
            : ''
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
        onConfirm={() => deletingSale && deleteMutation.mutate(deletingSale)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
