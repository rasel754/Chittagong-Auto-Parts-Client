import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Wrench, Lock, Phone, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { useAuthStore } from './authStore';
import { queryClient } from '@/lib/query-client';
import { toast, ToastContainer } from '@/components/ui/toast';
import { toEnglishDigits } from '@/lib/number';

const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'ফোন নম্বর আবশ্যক')
    .refine((val) => {
      const clean = toEnglishDigits(val).replace(/[^0-9]/g, '');
      return clean.length === 11 && (clean.startsWith('013') || clean.startsWith('014') || clean.startsWith('015') || clean.startsWith('016') || clean.startsWith('017') || clean.startsWith('018') || clean.startsWith('019'));
    }, 'সঠিক ১১ ডিজিটের বাংলাদেশি ফোন নম্বর লিখুন (যেমন: 017xxxxxxxx বা ০১৭xxxxxxxx)'),
  password: z.string().min(4, 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '01811000000',
      password: 'AdminPassword123!',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const cleanPhone = toEnglishDigits(data.phone).replace(/[^0-9]/g, '');
      await login(cleanPhone, data.password);
      await queryClient.invalidateQueries();
      toast.success('স্বাগতম!', 'সফলভাবে লগইন সম্পন্ন হয়েছে');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(t('auth.invalidCredentials'), err.message);
    }
  };


  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white relative">
      {/* Top Language Toggle */}
      <div className="absolute top-6 right-6">
        <LanguageToggle className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-950/50 mb-2">
            <Wrench className="h-10 w-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t('app.title')}
          </h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            {t('app.subtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-left">
            <h2 className="text-lg font-bold text-white">{t('auth.loginTitle')}</h2>
            <p className="text-xs text-slate-400 mt-1">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Phone input */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-300">
                {t('auth.phoneLabel')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder={t('auth.phonePlaceholder')}
                  {...register('phone')}
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-400 font-medium">{errors.phone.message}</p>
              )}
            </div>

            {/* Password input */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-300">
                {t('auth.passwordLabel')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  {...register('password')}
                  className="w-full h-11 pl-9 pr-10 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/40 transition-all mt-2"
            >
              {isLoading ? t('auth.loggingIn') : t('auth.loginBtn')}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>সুরক্ষিত ব্যবসায়িক ড্যাশবোর্ড এক্সেস</span>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
