'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { usePageTitle } from '../../layout';

// Zod validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Mevcut şifre gereklidir'),
  newPassword: z.string()
    .min(8, 'Yeni şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'Yeni şifre en az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'Yeni şifre en az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'Yeni şifre en az bir rakam içermelidir')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Yeni şifre en az bir özel karakter içermelidir'),
  confirmPassword: z.string()
    .min(1, 'Şifre tekrarı gereklidir')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword']
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { setPageTitle } = usePageTitle();
  const [formData, setFormData] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordForm, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setPageTitle('Şifre Değiştir');
  }, [setPageTitle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ChangePasswordForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    // Clear general messages
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');

    // Validate form data
    const result = changePasswordSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangePasswordForm, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof ChangePasswordForm;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Şifre başarıyla güncellendi');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect to settings page after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/settings');
        }, 2000);
      } else {
        setErrorMessage(data.message || 'Şifre değiştirilemedi');
      }
    } catch (error) {
      setErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/settings');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={handleCancel}
            className="btn btn-ghost btn-sm btn-circle text-text-400 hover:text-text-600 hover:bg-primary-50 hover:border-none"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-500">Şifre Değiştir</h1>
            <p className="text-text-300 mt-1">Hesabınızın güvenliği için güçlü bir şifre seçin</p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="alert alert-success bg-green-50 border-green-200 text-green-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error bg-red-50 border-red-200 text-red-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="card bg-white shadow-lg">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-text-500 font-medium">Mevcut Şifre</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder=""
                  className={`input input-bordered w-full pr-12 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-500 focus:border-transparent ${
                    errors.currentPassword ? 'input-error border-red-500' : ''
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-400 hover:text-text-600 z-10 focus:outline-none"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 16C14.658 16 18.5 13.839 18.5 11C18.5 8.161 14.658 6 10 6C5.342 6 1.5 8.161 1.5 11C1.5 13.839 5.342 16 10 16ZM10 7C14.179 7 17.5 8.868 17.5 11C17.5 13.132 14.179 15 10 15C5.821 15 2.5 13.132 2.5 11C2.5 8.868 5.821 7 10 7Z" fill="#f8a45a"/>
                      <path d="M9.50003 3.5C9.50003 3.36739 9.55271 3.24021 9.64648 3.14645C9.74024 3.05268 9.86742 3 10 3C10.1326 3 10.2598 3.05268 10.3536 3.14645C10.4474 3.24021 10.5 3.36739 10.5 3.5V6.5C10.5 6.63261 10.4474 6.75979 10.3536 6.85355C10.2598 6.94732 10.1326 7 10 7C9.86742 7 9.74024 6.94732 9.64648 6.85355C9.55271 6.75979 9.50003 6.63261 9.50003 6.5V3.5ZM13.51 3.902C13.5398 3.77584 13.6174 3.66617 13.7265 3.59613C13.8356 3.5261 13.9676 3.50116 14.0947 3.52658C14.2218 3.552 14.3341 3.6258 14.4078 3.7324C14.4816 3.83901 14.5111 3.97009 14.49 4.098L13.99 6.598C13.9602 6.72416 13.8826 6.83383 13.7736 6.90387C13.6645 6.9739 13.5325 6.99884 13.4053 6.97342C13.2782 6.948 13.166 6.8742 13.0922 6.7676C13.0185 6.66099 12.989 6.52991 13.01 6.402L13.51 3.902ZM6.49003 3.902C6.46025 3.77584 6.38263 3.66617 6.27355 3.59613C6.16448 3.5261 6.03246 3.50116 5.90535 3.52658C5.77823 3.552 5.66596 3.6258 5.59221 3.7324C5.51846 3.83901 5.489 3.97009 5.51003 4.098L6.01003 6.598C6.03981 6.72416 6.11743 6.83383 6.22651 6.90387C6.33559 6.9739 6.4676 6.99884 6.59471 6.97342C6.72183 6.948 6.8341 6.8742 6.90785 6.7676C6.9816 6.66099 7.01106 6.52991 6.99003 6.402L6.49003 3.902ZM2.42903 5.243C2.36087 5.12922 2.2503 5.04718 2.12165 5.01492C1.993 4.98267 1.85681 5.00284 1.74303 5.071C1.62925 5.13916 1.54721 5.24973 1.51496 5.37838C1.4827 5.50703 1.50287 5.64322 1.57103 5.757L3.07103 8.257C3.13919 8.37078 3.24976 8.45282 3.37841 8.48507C3.50706 8.51733 3.64325 8.49716 3.75703 8.429C3.87081 8.36084 3.95285 8.25027 3.98511 8.12162C4.01736 7.99297 3.99719 7.85678 3.92903 7.743L2.42903 5.243ZM17.571 5.243C17.6048 5.18666 17.6493 5.13752 17.702 5.09839C17.7548 5.05926 17.8147 5.0309 17.8784 5.01492C17.9421 4.99895 18.0083 4.99568 18.0733 5.00531C18.1383 5.01493 18.2007 5.03725 18.257 5.071C18.3134 5.10475 18.3625 5.14927 18.4016 5.20201C18.4408 5.25475 18.4691 5.31468 18.4851 5.37838C18.5011 5.44208 18.5043 5.5083 18.4947 5.57327C18.4851 5.63823 18.4628 5.70066 18.429 5.757L16.929 8.257C16.8953 8.31334 16.8508 8.36248 16.798 8.40161C16.7453 8.44074 16.6854 8.4691 16.6217 8.48507C16.558 8.50105 16.4917 8.50432 16.4268 8.49469C16.3618 8.48507 16.2994 8.46275 16.243 8.429C16.1867 8.39525 16.1376 8.35073 16.0984 8.29799C16.0593 8.24525 16.0309 8.18532 16.015 8.12162C15.999 8.05792 15.9957 7.9917 16.0053 7.92673C16.015 7.86177 16.0373 7.79934 16.071 7.743L17.571 5.243ZM13 10.5C13 11.2956 12.684 12.0587 12.1214 12.6213C11.5587 13.1839 10.7957 13.5 10 13.5C9.20438 13.5 8.44132 13.1839 7.87871 12.6213C7.3161 12.0587 7.00003 11.2956 7.00003 10.5C7.00003 9.70435 7.3161 8.94129 7.87871 8.37868C8.44132 7.81607 9.20438 7.5 10 7.5C10.7957 7.5 11.5587 7.81607 12.1214 8.37868C12.684 8.94129 13 9.70435 13 10.5Z" fill="#f8a45a"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.09402 8.01399C2.05356 7.96081 2.02416 7.90005 2.00758 7.83532C1.991 7.77058 1.98756 7.70318 1.99747 7.63709C2.00738 7.571 2.03044 7.50757 2.06528 7.45055C2.10013 7.39352 2.14605 7.34406 2.20033 7.30509C2.25462 7.26611 2.31616 7.23841 2.38133 7.22363C2.4465 7.20885 2.51398 7.20728 2.57976 7.21902C2.64555 7.23075 2.70832 7.25556 2.76436 7.29197C2.82039 7.32838 2.86856 7.37565 2.90602 7.43099C3.25402 7.91499 3.77602 8.36499 4.44202 8.74899C5.81502 9.54099 7.69202 9.99999 9.70402 9.99999C11.716 9.99999 13.594 9.54099 14.967 8.74899C15.632 8.36499 16.154 7.91499 16.502 7.43099C16.5793 7.32318 16.6963 7.2505 16.8272 7.22893C16.9581 7.20736 17.0922 7.23868 17.2 7.31599C17.3078 7.3933 17.3805 7.51027 17.4021 7.64117C17.4236 7.77207 17.3923 7.90618 17.315 8.01399C16.878 8.62199 16.248 9.16399 15.467 9.61499C13.934 10.499 11.884 11 9.70402 11C7.52402 11 5.47402 10.5 3.94202 9.61499C3.16002 9.16399 2.53002 8.62199 2.09402 8.01499" fill="#a0aec0"/>
                      <path d="M10.5 11C10.5 10.8674 10.4473 10.7402 10.3536 10.6464C10.2598 10.5527 10.1326 10.5 10 10.5C9.8674 10.5 9.74023 10.5527 9.64646 10.6464C9.55269 10.7402 9.50001 10.8674 9.50001 11V13.5C9.50001 13.6326 9.55269 13.7598 9.64646 13.8535C9.74023 13.9473 9.8674 14 10 14C10.1326 14 10.2598 13.9473 10.3536 13.8535C10.4473 13.7598 10.5 13.6326 10.5 13.5V11ZM6.01001 10.402C6.0209 10.3358 6.04501 10.2724 6.0809 10.2157C6.11679 10.159 6.16373 10.1101 6.21892 10.0719C6.27411 10.0337 6.33642 10.0071 6.40214 9.99347C6.46786 9.97988 6.53564 9.97966 6.60144 9.99282C6.66725 10.006 6.72973 10.0323 6.78517 10.0701C6.84061 10.1079 6.88786 10.1565 6.92412 10.213C6.96038 10.2694 6.9849 10.3326 6.99622 10.3988C7.00754 10.4649 7.00543 10.5327 6.99001 10.598L6.49001 13.098C6.46023 13.2241 6.38262 13.3338 6.27354 13.4039C6.16446 13.4739 6.03244 13.4988 5.90533 13.4734C5.77822 13.448 5.66595 13.3742 5.5922 13.2676C5.51844 13.161 5.48898 13.0299 5.51001 12.902L6.01001 10.402ZM13.99 10.402C13.9602 10.2758 13.8826 10.1662 13.7735 10.0961C13.6645 10.0261 13.5324 10.0011 13.4053 10.0266C13.2782 10.052 13.1659 10.1258 13.0922 10.2324C13.0184 10.339 12.989 10.4701 13.01 10.598L13.51 13.098C13.5398 13.2241 13.6174 13.3338 13.7265 13.4039C13.8356 13.4739 13.9676 13.4988 14.0947 13.4734C14.2218 13.448 14.3341 13.3742 14.4078 13.2676C14.4816 13.161 14.511 13.0299 14.49 12.902L13.99 10.402ZM16.354 8.64598C16.2601 8.5521 16.1328 8.49935 16 8.49935C15.8672 8.49935 15.7399 8.5521 15.646 8.64598C15.5521 8.73987 15.4994 8.86721 15.4994 8.99998C15.4994 9.13276 15.5521 9.2601 15.646 9.35398L17.646 11.354C17.7399 11.4479 17.8672 11.5006 18 11.5006C18.1328 11.5006 18.2601 11.4479 18.354 11.354C18.4479 11.2601 18.5006 11.1328 18.5006 11C18.5006 10.8672 18.4479 10.7399 18.354 10.646L16.354 8.64598ZM3.44801 8.66398C3.49153 8.61322 3.54479 8.5717 3.60463 8.54189C3.66448 8.51207 3.7297 8.49455 3.79643 8.49038C3.86316 8.48621 3.93006 8.49547 3.99315 8.51761C4.05624 8.53974 4.11425 8.57431 4.16375 8.61926C4.21325 8.66421 4.25323 8.71863 4.28133 8.77931C4.30942 8.83998 4.32507 8.90567 4.32733 8.9725C4.32959 9.03932 4.31843 9.10592 4.2945 9.16835C4.27057 9.23079 4.23436 9.28779 4.18801 9.33598L2.37001 11.336C2.27981 11.4298 2.15659 11.4847 2.02653 11.4891C1.89647 11.4935 1.76982 11.447 1.67348 11.3596C1.57714 11.2721 1.5187 11.1505 1.51059 11.0206C1.50247 10.8907 1.54531 10.7628 1.63001 10.664L3.44801 8.66398Z" fill="#a0aec0"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <label className="label">
                  <span className="label-text-alt text-red-500">{errors.currentPassword}</span>
                </label>
              )}
            </div>

            {/* New Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-text-500 font-medium">Yeni Şifre</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder=""
                  className={`input input-bordered w-full pr-12 text-text-500 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.newPassword ? 'input-error border-red-500' : ''
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-400 hover:text-text-600 z-10 focus:outline-none"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 16C14.658 16 18.5 13.839 18.5 11C18.5 8.161 14.658 6 10 6C5.342 6 1.5 8.161 1.5 11C1.5 13.839 5.342 16 10 16ZM10 7C14.179 7 17.5 8.868 17.5 11C17.5 13.132 14.179 15 10 15C5.821 15 2.5 13.132 2.5 11C2.5 8.868 5.821 7 10 7Z" fill="#f8a45a"/>
                      <path d="M9.50003 3.5C9.50003 3.36739 9.55271 3.24021 9.64648 3.14645C9.74024 3.05268 9.86742 3 10 3C10.1326 3 10.2598 3.05268 10.3536 3.14645C10.4474 3.24021 10.5 3.36739 10.5 3.5V6.5C10.5 6.63261 10.4474 6.75979 10.3536 6.85355C10.2598 6.94732 10.1326 7 10 7C9.86742 7 9.74024 6.94732 9.64648 6.85355C9.55271 6.75979 9.50003 6.63261 9.50003 6.5V3.5ZM13.51 3.902C13.5398 3.77584 13.6174 3.66617 13.7265 3.59613C13.8356 3.5261 13.9676 3.50116 14.0947 3.52658C14.2218 3.552 14.3341 3.6258 14.4078 3.7324C14.4816 3.83901 14.5111 3.97009 14.49 4.098L13.99 6.598C13.9602 6.72416 13.8826 6.83383 13.7736 6.90387C13.6645 6.9739 13.5325 6.99884 13.4053 6.97342C13.2782 6.948 13.166 6.8742 13.0922 6.7676C13.0185 6.66099 12.989 6.52991 13.01 6.402L13.51 3.902ZM6.49003 3.902C6.46025 3.77584 6.38263 3.66617 6.27355 3.59613C6.16448 3.5261 6.03246 3.50116 5.90535 3.52658C5.77823 3.552 5.66596 3.6258 5.59221 3.7324C5.51846 3.83901 5.489 3.97009 5.51003 4.098L6.01003 6.598C6.03981 6.72416 6.11743 6.83383 6.22651 6.90387C6.33559 6.9739 6.4676 6.99884 6.59471 6.97342C6.72183 6.948 6.8341 6.8742 6.90785 6.7676C6.9816 6.66099 7.01106 6.52991 6.99003 6.402L6.49003 3.902ZM2.42903 5.243C2.36087 5.12922 2.2503 5.04718 2.12165 5.01492C1.993 4.98267 1.85681 5.00284 1.74303 5.071C1.62925 5.13916 1.54721 5.24973 1.51496 5.37838C1.4827 5.50703 1.50287 5.64322 1.57103 5.757L3.07103 8.257C3.13919 8.37078 3.24976 8.45282 3.37841 8.48507C3.50706 8.51733 3.64325 8.49716 3.75703 8.429C3.87081 8.36084 3.95285 8.25027 3.98511 8.12162C4.01736 7.99297 3.99719 7.85678 3.92903 7.743L2.42903 5.243ZM17.571 5.243C17.6048 5.18666 17.6493 5.13752 17.702 5.09839C17.7548 5.05926 17.8147 5.0309 17.8784 5.01492C17.9421 4.99895 18.0083 4.99568 18.0733 5.00531C18.1383 5.01493 18.2007 5.03725 18.257 5.071C18.3134 5.10475 18.3625 5.14927 18.4016 5.20201C18.4408 5.25475 18.4691 5.31468 18.4851 5.37838C18.5011 5.44208 18.5043 5.5083 18.4947 5.57327C18.4851 5.63823 18.4628 5.70066 18.429 5.757L16.929 8.257C16.8953 8.31334 16.8508 8.36248 16.798 8.40161C16.7453 8.44074 16.6854 8.4691 16.6217 8.48507C16.558 8.50105 16.4917 8.50432 16.4268 8.49469C16.3618 8.48507 16.2994 8.46275 16.243 8.429C16.1867 8.39525 16.1376 8.35073 16.0984 8.29799C16.0593 8.24525 16.0309 8.18532 16.015 8.12162C15.999 8.05792 15.9957 7.9917 16.0053 7.92673C16.015 7.86177 16.0373 7.79934 16.071 7.743L17.571 5.243ZM13 10.5C13 11.2956 12.684 12.0587 12.1214 12.6213C11.5587 13.1839 10.7957 13.5 10 13.5C9.20438 13.5 8.44132 13.1839 7.87871 12.6213C7.3161 12.0587 7.00003 11.2956 7.00003 10.5C7.00003 9.70435 7.3161 8.94129 7.87871 8.37868C8.44132 7.81607 9.20438 7.5 10 7.5C10.7957 7.5 11.5587 7.81607 12.1214 8.37868C12.684 8.94129 13 9.70435 13 10.5Z" fill="#f8a45a"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.09402 8.01399C2.05356 7.96081 2.02416 7.90005 2.00758 7.83532C1.991 7.77058 1.98756 7.70318 1.99747 7.63709C2.00738 7.571 2.03044 7.50757 2.06528 7.45055C2.10013 7.39352 2.14605 7.34406 2.20033 7.30509C2.25462 7.26611 2.31616 7.23841 2.38133 7.22363C2.4465 7.20885 2.51398 7.20728 2.57976 7.21902C2.64555 7.23075 2.70832 7.25556 2.76436 7.29197C2.82039 7.32838 2.86856 7.37565 2.90602 7.43099C3.25402 7.91499 3.77602 8.36499 4.44202 8.74899C5.81502 9.54099 7.69202 9.99999 9.70402 9.99999C11.716 9.99999 13.594 9.54099 14.967 8.74899C15.632 8.36499 16.154 7.91499 16.502 7.43099C16.5793 7.32318 16.6963 7.2505 16.8272 7.22893C16.9581 7.20736 17.0922 7.23868 17.2 7.31599C17.3078 7.3933 17.3805 7.51027 17.4021 7.64117C17.4236 7.77207 17.3923 7.90618 17.315 8.01399C16.878 8.62199 16.248 9.16399 15.467 9.61499C13.934 10.499 11.884 11 9.70402 11C7.52402 11 5.47402 10.5 3.94202 9.61499C3.16002 9.16399 2.53002 8.62199 2.09402 8.01499" fill="#a0aec0"/>
                      <path d="M10.5 11C10.5 10.8674 10.4473 10.7402 10.3536 10.6464C10.2598 10.5527 10.1326 10.5 10 10.5C9.8674 10.5 9.74023 10.5527 9.64646 10.6464C9.55269 10.7402 9.50001 10.8674 9.50001 11V13.5C9.50001 13.6326 9.55269 13.7598 9.64646 13.8535C9.74023 13.9473 9.8674 14 10 14C10.1326 14 10.2598 13.9473 10.3536 13.8535C10.4473 13.7598 10.5 13.6326 10.5 13.5V11ZM6.01001 10.402C6.0209 10.3358 6.04501 10.2724 6.0809 10.2157C6.11679 10.159 6.16373 10.1101 6.21892 10.0719C6.27411 10.0337 6.33642 10.0071 6.40214 9.99347C6.46786 9.97988 6.53564 9.97966 6.60144 9.99282C6.66725 10.006 6.72973 10.0323 6.78517 10.0701C6.84061 10.1079 6.88786 10.1565 6.92412 10.213C6.96038 10.2694 6.9849 10.3326 6.99622 10.3988C7.00754 10.4649 7.00543 10.5327 6.99001 10.598L6.49001 13.098C6.46023 13.2241 6.38262 13.3338 6.27354 13.4039C6.16446 13.4739 6.03244 13.4988 5.90533 13.4734C5.77822 13.448 5.66595 13.3742 5.5922 13.2676C5.51844 13.161 5.48898 13.0299 5.51001 12.902L6.01001 10.402ZM13.99 10.402C13.9602 10.2758 13.8826 10.1662 13.7735 10.0961C13.6645 10.0261 13.5324 10.0011 13.4053 10.0266C13.2782 10.052 13.1659 10.1258 13.0922 10.2324C13.0184 10.339 12.989 10.4701 13.01 10.598L13.51 13.098C13.5398 13.2241 13.6174 13.3338 13.7265 13.4039C13.8356 13.4739 13.9676 13.4988 14.0947 13.4734C14.2218 13.448 14.3341 13.3742 14.4078 13.2676C14.4816 13.161 14.511 13.0299 14.49 12.902L13.99 10.402ZM16.354 8.64598C16.2601 8.5521 16.1328 8.49935 16 8.49935C15.8672 8.49935 15.7399 8.5521 15.646 8.64598C15.5521 8.73987 15.4994 8.86721 15.4994 8.99998C15.4994 9.13276 15.5521 9.2601 15.646 9.35398L17.646 11.354C17.7399 11.4479 17.8672 11.5006 18 11.5006C18.1328 11.5006 18.2601 11.4479 18.354 11.354C18.4479 11.2601 18.5006 11.1328 18.5006 11C18.5006 10.8672 18.4479 10.7399 18.354 10.646L16.354 8.64598ZM3.44801 8.66398C3.49153 8.61322 3.54479 8.5717 3.60463 8.54189C3.66448 8.51207 3.7297 8.49455 3.79643 8.49038C3.86316 8.48621 3.93006 8.49547 3.99315 8.51761C4.05624 8.53974 4.11425 8.57431 4.16375 8.61926C4.21325 8.66421 4.25323 8.71863 4.28133 8.77931C4.30942 8.83998 4.32507 8.90567 4.32733 8.9725C4.32959 9.03932 4.31843 9.10592 4.2945 9.16835C4.27057 9.23079 4.23436 9.28779 4.18801 9.33598L2.37001 11.336C2.27981 11.4298 2.15659 11.4847 2.02653 11.4891C1.89647 11.4935 1.76982 11.447 1.67348 11.3596C1.57714 11.2721 1.5187 11.1505 1.51059 11.0206C1.50247 10.8907 1.54531 10.7628 1.63001 10.664L3.44801 8.66398Z" fill="#a0aec0"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <label className="label">
                  <span className="label-text-alt text-red-500">{errors.newPassword}</span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt text-text-400">
                  En az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter içermelidir
                </span>
              </label>
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-text-500 font-medium">Yeni Şifre (Tekrar)</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder=""
                  className={`input input-bordered w-full text-text-500 pr-12 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.confirmPassword ? 'input-error border-red-500' : ''
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-400 hover:text-text-600 z-10 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 16C14.658 16 18.5 13.839 18.5 11C18.5 8.161 14.658 6 10 6C5.342 6 1.5 8.161 1.5 11C1.5 13.839 5.342 16 10 16ZM10 7C14.179 7 17.5 8.868 17.5 11C17.5 13.132 14.179 15 10 15C5.821 15 2.5 13.132 2.5 11C2.5 8.868 5.821 7 10 7Z" fill="#f8a45a"/>
                      <path d="M9.50003 3.5C9.50003 3.36739 9.55271 3.24021 9.64648 3.14645C9.74024 3.05268 9.86742 3 10 3C10.1326 3 10.2598 3.05268 10.3536 3.14645C10.4474 3.24021 10.5 3.36739 10.5 3.5V6.5C10.5 6.63261 10.4474 6.75979 10.3536 6.85355C10.2598 6.94732 10.1326 7 10 7C9.86742 7 9.74024 6.94732 9.64648 6.85355C9.55271 6.75979 9.50003 6.63261 9.50003 6.5V3.5ZM13.51 3.902C13.5398 3.77584 13.6174 3.66617 13.7265 3.59613C13.8356 3.5261 13.9676 3.50116 14.0947 3.52658C14.2218 3.552 14.3341 3.6258 14.4078 3.7324C14.4816 3.83901 14.5111 3.97009 14.49 4.098L13.99 6.598C13.9602 6.72416 13.8826 6.83383 13.7736 6.90387C13.6645 6.9739 13.5325 6.99884 13.4053 6.97342C13.2782 6.948 13.166 6.8742 13.0922 6.7676C13.0185 6.66099 12.989 6.52991 13.01 6.402L13.51 3.902ZM6.49003 3.902C6.46025 3.77584 6.38263 3.66617 6.27355 3.59613C6.16448 3.5261 6.03246 3.50116 5.90535 3.52658C5.77823 3.552 5.66596 3.6258 5.59221 3.7324C5.51846 3.83901 5.489 3.97009 5.51003 4.098L6.01003 6.598C6.03981 6.72416 6.11743 6.83383 6.22651 6.90387C6.33559 6.9739 6.4676 6.99884 6.59471 6.97342C6.72183 6.948 6.8341 6.8742 6.90785 6.7676C6.9816 6.66099 7.01106 6.52991 6.99003 6.402L6.49003 3.902ZM2.42903 5.243C2.36087 5.12922 2.2503 5.04718 2.12165 5.01492C1.993 4.98267 1.85681 5.00284 1.74303 5.071C1.62925 5.13916 1.54721 5.24973 1.51496 5.37838C1.4827 5.50703 1.50287 5.64322 1.57103 5.757L3.07103 8.257C3.13919 8.37078 3.24976 8.45282 3.37841 8.48507C3.50706 8.51733 3.64325 8.49716 3.75703 8.429C3.87081 8.36084 3.95285 8.25027 3.98511 8.12162C4.01736 7.99297 3.99719 7.85678 3.92903 7.743L2.42903 5.243ZM17.571 5.243C17.6048 5.18666 17.6493 5.13752 17.702 5.09839C17.7548 5.05926 17.8147 5.0309 17.8784 5.01492C17.9421 4.99895 18.0083 4.99568 18.0733 5.00531C18.1383 5.01493 18.2007 5.03725 18.257 5.071C18.3134 5.10475 18.3625 5.14927 18.4016 5.20201C18.4408 5.25475 18.4691 5.31468 18.4851 5.37838C18.5011 5.44208 18.5043 5.5083 18.4947 5.57327C18.4851 5.63823 18.4628 5.70066 18.429 5.757L16.929 8.257C16.8953 8.31334 16.8508 8.36248 16.798 8.40161C16.7453 8.44074 16.6854 8.4691 16.6217 8.48507C16.558 8.50105 16.4917 8.50432 16.4268 8.49469C16.3618 8.48507 16.2994 8.46275 16.243 8.429C16.1867 8.39525 16.1376 8.35073 16.0984 8.29799C16.0593 8.24525 16.0309 8.18532 16.015 8.12162C15.999 8.05792 15.9957 7.9917 16.0053 7.92673C16.015 7.86177 16.0373 7.79934 16.071 7.743L17.571 5.243ZM13 10.5C13 11.2956 12.684 12.0587 12.1214 12.6213C11.5587 13.1839 10.7957 13.5 10 13.5C9.20438 13.5 8.44132 13.1839 7.87871 12.6213C7.3161 12.0587 7.00003 11.2956 7.00003 10.5C7.00003 9.70435 7.3161 8.94129 7.87871 8.37868C8.44132 7.81607 9.20438 7.5 10 7.5C10.7957 7.5 11.5587 7.81607 12.1214 8.37868C12.684 8.94129 13 9.70435 13 10.5Z" fill="#f8a45a"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.09402 8.01399C2.05356 7.96081 2.02416 7.90005 2.00758 7.83532C1.991 7.77058 1.98756 7.70318 1.99747 7.63709C2.00738 7.571 2.03044 7.50757 2.06528 7.45055C2.10013 7.39352 2.14605 7.34406 2.20033 7.30509C2.25462 7.26611 2.31616 7.23841 2.38133 7.22363C2.4465 7.20885 2.51398 7.20728 2.57976 7.21902C2.64555 7.23075 2.70832 7.25556 2.76436 7.29197C2.82039 7.32838 2.86856 7.37565 2.90602 7.43099C3.25402 7.91499 3.77602 8.36499 4.44202 8.74899C5.81502 9.54099 7.69202 9.99999 9.70402 9.99999C11.716 9.99999 13.594 9.54099 14.967 8.74899C15.632 8.36499 16.154 7.91499 16.502 7.43099C16.5793 7.32318 16.6963 7.2505 16.8272 7.22893C16.9581 7.20736 17.0922 7.23868 17.2 7.31599C17.3078 7.3933 17.3805 7.51027 17.4021 7.64117C17.4236 7.77207 17.3923 7.90618 17.315 8.01399C16.878 8.62199 16.248 9.16399 15.467 9.61499C13.934 10.499 11.884 11 9.70402 11C7.52402 11 5.47402 10.5 3.94202 9.61499C3.16002 9.16399 2.53002 8.62199 2.09402 8.01499" fill="#a0aec0"/>
                      <path d="M10.5 11C10.5 10.8674 10.4473 10.7402 10.3536 10.6464C10.2598 10.5527 10.1326 10.5 10 10.5C9.8674 10.5 9.74023 10.5527 9.64646 10.6464C9.55269 10.7402 9.50001 10.8674 9.50001 11V13.5C9.50001 13.6326 9.55269 13.7598 9.64646 13.8535C9.74023 13.9473 9.8674 14 10 14C10.1326 14 10.2598 13.9473 10.3536 13.8535C10.4473 13.7598 10.5 13.6326 10.5 13.5V11ZM6.01001 10.402C6.0209 10.3358 6.04501 10.2724 6.0809 10.2157C6.11679 10.159 6.16373 10.1101 6.21892 10.0719C6.27411 10.0337 6.33642 10.0071 6.40214 9.99347C6.46786 9.97988 6.53564 9.97966 6.60144 9.99282C6.66725 10.006 6.72973 10.0323 6.78517 10.0701C6.84061 10.1079 6.88786 10.1565 6.92412 10.213C6.96038 10.2694 6.9849 10.3326 6.99622 10.3988C7.00754 10.4649 7.00543 10.5327 6.99001 10.598L6.49001 13.098C6.46023 13.2241 6.38262 13.3338 6.27354 13.4039C6.16446 13.4739 6.03244 13.4988 5.90533 13.4734C5.77822 13.448 5.66595 13.3742 5.5922 13.2676C5.51844 13.161 5.48898 13.0299 5.51001 12.902L6.01001 10.402ZM13.99 10.402C13.9602 10.2758 13.8826 10.1662 13.7735 10.0961C13.6645 10.0261 13.5324 10.0011 13.4053 10.0266C13.2782 10.052 13.1659 10.1258 13.0922 10.2324C13.0184 10.339 12.989 10.4701 13.01 10.598L13.51 13.098C13.5398 13.2241 13.6174 13.3338 13.7265 13.4039C13.8356 13.4739 13.9676 13.4988 14.0947 13.4734C14.2218 13.448 14.3341 13.3742 14.4078 13.2676C14.4816 13.161 14.511 13.0299 14.49 12.902L13.99 10.402ZM16.354 8.64598C16.2601 8.5521 16.1328 8.49935 16 8.49935C15.8672 8.49935 15.7399 8.5521 15.646 8.64598C15.5521 8.73987 15.4994 8.86721 15.4994 8.99998C15.4994 9.13276 15.5521 9.2601 15.646 9.35398L17.646 11.354C17.7399 11.4479 17.8672 11.5006 18 11.5006C18.1328 11.5006 18.2601 11.4479 18.354 11.354C18.4479 11.2601 18.5006 11.1328 18.5006 11C18.5006 10.8672 18.4479 10.7399 18.354 10.646L16.354 8.64598ZM3.44801 8.66398C3.49153 8.61322 3.54479 8.5717 3.60463 8.54189C3.66448 8.51207 3.7297 8.49455 3.79643 8.49038C3.86316 8.48621 3.93006 8.49547 3.99315 8.51761C4.05624 8.53974 4.11425 8.57431 4.16375 8.61926C4.21325 8.66421 4.25323 8.71863 4.28133 8.77931C4.30942 8.83998 4.32507 8.90567 4.32733 8.9725C4.32959 9.03932 4.31843 9.10592 4.2945 9.16835C4.27057 9.23079 4.23436 9.28779 4.18801 9.33598L2.37001 11.336C2.27981 11.4298 2.15659 11.4847 2.02653 11.4891C1.89647 11.4935 1.76982 11.447 1.67348 11.3596C1.57714 11.2721 1.5187 11.1505 1.51059 11.0206C1.50247 10.8907 1.54531 10.7628 1.63001 10.664L3.44801 8.66398Z" fill="#a0aec0"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-red-500">{errors.confirmPassword}</span>
                </label>
              )}
            </div>

            {/* Info Box */}
            <div className="alert bg-primary-50 border-primary-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-primary-600 shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-primary-700 text-sm">
                Güvenlik nedeniyle şifre değiştirdikten sonra tekrar giriş yapmanız gerekebilir.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="btn btn-primary bg-primary-500 hover:bg-primary-600 border-none text-white flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Değiştiriliyor...
                  </>
                ) : (
                  'Şifreyi Değiştir'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost hover:border-red-100 text-text-500 hover:bg-red-100"
                disabled={isLoading}
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Tips */}
      <div className="mt-8 card bg-white shadow">
        <div className="card-body">
          <h3 className="font-semibold text-text-500 mb-3">Güvenli Şifre İpuçları</h3>
          <ul className="space-y-2 text-sm text-text-400">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>En az 8 karakter uzunluğunda bir şifre kullanın</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>En az 1 büyük ve 1 küçük harf kullanın</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>En az 1 rakam ve özel karakter (!@#$%^&*) ekleyin</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Kolay tahmin edilebilecek kelimelerden kaçının</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Şifrenizi düzenli olarak değiştirin</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
