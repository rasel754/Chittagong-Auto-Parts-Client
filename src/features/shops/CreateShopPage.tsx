import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { toast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Store, ArrowLeft } from 'lucide-react';

const shopSchema = z.object({
  name: z.string().min(2, 'দোকানের নাম আবশ্যক'),
  code: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type ShopFormData = z.infer<typeof shopSchema>;

export const CreateShopPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
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
      navigate(`/shops/${newShop.id}/dashboard`);
    },
    onError: (err: any) => {
      toast.error(t('common.errorOccurred'), err.message || 'দোকান তৈরি করা যায়নি');
    },
  });

  const onSubmit = (data: ShopFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/dashboard')}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t('shops.backToDashboard')}</span>
      </Button>

      <Card className="shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Store className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{t('shops.createTitle')}</CardTitle>
                <CardDescription>{t('shops.createSubtitle')}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
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
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              {mutation.isPending ? t('shops.creating') : t('shops.submitBtn')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
