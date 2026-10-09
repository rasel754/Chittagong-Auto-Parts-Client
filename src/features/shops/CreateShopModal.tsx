import React from 'react';
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
import { Store } from 'lucide-react';
import { useShopStore } from './shopStore';

const shopSchema = z.object({
  name: z.string().min(2, 'দোকানের নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  code: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type ShopFormData = z.infer<typeof shopSchema>;

export const CreateShopModal: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isCreateModalOpen, closeCreateModal } = useShopStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ShopFormData) => api.createShop(data),
    onSuccess: (newShop) => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(t('shops.successMessage'), `${newShop.name} যুক্ত হয়েছে`);
      reset();
      closeCreateModal();
    },
    onError: (err: any) => {
      toast.error(t('common.errorOccurred'), err.message || 'দোকান তৈরি করা যায়নি');
    },
  });

  const onSubmit = (data: ShopFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={(open) => !open && closeCreateModal()}>
      <DialogContent onClose={closeCreateModal}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle>{t('shops.createTitle')}</DialogTitle>
                <DialogDescription>{t('shops.createSubtitle')}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              label={t('shops.shopName')}
              placeholder={t('shops.shopNamePlaceholder')}
              required
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label={t('shops.shopCode')}
              placeholder={t('shops.shopCodePlaceholder')}
              {...register('code')}
              error={errors.code?.message}
            />

            <Input
              label={t('shops.address')}
              placeholder={t('shops.addressPlaceholder')}
              {...register('address')}
              error={errors.address?.message}
            />

            <Input
              label={t('shops.phone')}
              placeholder={t('shops.phonePlaceholder')}
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeCreateModal}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              {mutation.isPending ? t('shops.creating') : t('shops.submitBtn')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
