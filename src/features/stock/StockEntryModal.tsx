import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { toast } from '@/components/ui/toast';
import { formatCurrency } from '@/lib/currency';
import { getTodayDateString } from '@/lib/date';
import { Shop, StockEntry } from '@/types';
import { Boxes, Calculator, Edit3 } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

const stockSchema = z.object({
  shopId: z.string().min(1, 'দোকান নির্বাচন করুন'),
  productName: z.string().min(2, 'পণ্যের নাম আবশ্যক'),
  sku: z.string().optional(),
  quantityReceived: z
    .number({ invalid_type_error: 'সঠিক সংখ্যা লিখুন' })
    .positive('পরিমাণ ১ বা তার বেশি হতে হবে'),
  buyingRate: z
    .number({ invalid_type_error: 'সঠিক মূল্য লিখুন' })
    .positive('ক্রয়মূল্য ধনাত্মক হতে হবে'),
  sellingRate: z
    .number({ invalid_type_error: 'সঠিক মূল্য লিখুন' })
    .positive('বিক্রয়মূল্য ধনাত্মক হতে হবে'),
  supplierName: z.string().min(2, 'সাপ্লায়ারের নাম লিখুন'),
  entryDate: z.string().min(1, 'তারিখ আবশ্যক'),
  notes: z.string().optional(),
});

type StockFormData = z.infer<typeof stockSchema>;

interface StockEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultShopId?: string;
  shops: Shop[];
  initialData?: StockEntry | null;
}

export const StockEntryModal: React.FC<StockEntryModalProps> = ({
  open,
  onOpenChange,
  defaultShopId,
  shops,
  initialData,
}) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as 'bn' | 'en') || 'bn';
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<StockFormData | null>(null);

  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      shopId: defaultShopId || (shops[0]?.id || ''),
      productName: '',
      sku: '',
      quantityReceived: 1,
      buyingRate: 0,
      sellingRate: 0,
      supplierName: '',
      entryDate: getTodayDateString(),
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          shopId: initialData.shopId,
          productName: initialData.productName,
          sku: initialData.sku || '',
          quantityReceived: initialData.quantityReceived,
          buyingRate: initialData.buyingRate,
          sellingRate: initialData.sellingRate,
          supplierName: initialData.supplierName,
          entryDate: initialData.entryDate ? initialData.entryDate.slice(0, 10) : getTodayDateString(),
          notes: initialData.notes || '',
        });
      } else {
        reset({
          shopId: defaultShopId || (shops[0]?.id || ''),
          productName: '',
          sku: '',
          quantityReceived: 1,
          buyingRate: 0,
          sellingRate: 0,
          supplierName: '',
          entryDate: getTodayDateString(),
          notes: '',
        });
      }
    }
  }, [open, initialData, defaultShopId, shops, reset]);

  const qty = watch('quantityReceived') || 0;
  const buyingPrice = watch('buyingRate') || 0;
  const calculatedTotal = Math.max(0, qty * buyingPrice);

  const mutation = useMutation({
    mutationFn: (data: StockFormData) => {
      if (isEditMode && initialData) {
        return api.updateStockEntry(initialData.id, data);
      }
      return api.createStockEntry(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success(isEditMode ? t('stock.updateSuccess') : t('stock.successMessage'));
      reset();
      setShowConfirm(false);
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(t('common.errorOccurred'), err.message || (isEditMode ? 'স্টক আপডেট ব্যর্থ হয়েছে' : 'স্টক এন্ট্রি ব্যর্থ হয়েছে'));
      setShowConfirm(false);
    },
  });

  const onPreSubmit = (data: StockFormData) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleConfirmedSubmit = () => {
    if (pendingData) {
      mutation.mutate(pendingData);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl" onClose={() => onOpenChange(false)}>
          <form onSubmit={handleSubmit(onPreSubmit)}>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  {isEditMode ? <Edit3 className="h-6 w-6" /> : <Boxes className="h-6 w-6" />}
                </div>
                <div>
                  <DialogTitle>{isEditMode ? t('stock.editTitle') : t('stock.entryTitle')}</DialogTitle>
                  <DialogDescription>{t('stock.title')}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Shop selector */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  {t('stock.selectShop')} <span className="text-destructive">*</span>
                </label>
                <select
                  {...register('shopId')}
                  className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.shopId && (
                  <p className="text-xs text-destructive">{errors.shopId.message}</p>
                )}
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('stock.productName')}
                  placeholder={t('stock.productNamePlaceholder')}
                  required
                  {...register('productName')}
                  error={errors.productName?.message}
                />
                <Input
                  label={t('stock.sku')}
                  placeholder={t('stock.skuPlaceholder')}
                  {...register('sku')}
                  error={errors.sku?.message}
                />
              </div>

              {/* Quantity and Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label={t('stock.quantityReceived')}
                  type="number"
                  min="1"
                  step="1"
                  required
                  {...register('quantityReceived', { valueAsNumber: true })}
                  error={errors.quantityReceived?.message}
                />
                <Input
                  label={t('stock.buyingRate')}
                  type="number"
                  min="0"
                  step="any"
                  required
                  {...register('buyingRate', { valueAsNumber: true })}
                  error={errors.buyingRate?.message}
                />
                <Input
                  label={t('stock.sellingRate')}
                  type="number"
                  min="0"
                  step="any"
                  required
                  {...register('sellingRate', { valueAsNumber: true })}
                  error={errors.sellingRate?.message}
                />
              </div>

              {/* Live Calculation Banner */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
                  <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium">{t('stock.totalPurchaseValue')}:</span>
                </div>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(calculatedTotal, lang)}
                </span>
              </div>

              {/* Supplier & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('stock.supplierName')}
                  placeholder={t('stock.supplierNamePlaceholder')}
                  required
                  {...register('supplierName')}
                  error={errors.supplierName?.message}
                />
                <Input
                  label={t('stock.entryDate')}
                  type="date"
                  required
                  {...register('entryDate')}
                  error={errors.entryDate?.message}
                />
              </div>

              <Input
                label={t('stock.notes')}
                placeholder={t('stock.notesPlaceholder')}
                {...register('notes')}
                error={errors.notes?.message}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" isLoading={mutation.isPending}>
                {isEditMode ? t('stock.updateBtn') : t('stock.submitBtn')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Step */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={isEditMode ? t('stock.editTitle') : t('stock.confirmTitle')}
        description={`${pendingData?.productName || 'পণ্য'} (${pendingData?.quantityReceived || 0} পিস) - মোট ক্রয়মূল্য ${formatCurrency(
          (pendingData?.quantityReceived || 0) * (pendingData?.buyingRate || 0),
          lang
        )} ${isEditMode ? 'আপডেট করতে চান?' : 'যোগ করা হবে।'}`}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmedSubmit}
        isLoading={mutation.isPending}
      />
    </>
  );
};
