'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const SignInSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gereklidir"),
  password: z.string().min(1, "Şifre gereklidir")
});

type SignInFormData = z.infer<typeof SignInSchema>;

export default function WaiterLoginPage() {
  const router = useRouter();

  const [apiError, setApiError] = useState(""); 

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setApiError("");
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
      }
      
      router.push('/waiter/tables');

    } catch (err: any) {
      setApiError(err.message);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen px-6 bg-white relative overflow-hidden">
        
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#fde6d1] rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[#fde6f1] rounded-full opacity-50 blur-3xl"></div>

        <div className="z-10 w-full max-w-md mx-auto">
            
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-[#683817]" style={{ fontFamily: 'Pontano Sans, sans-serif' }}>
                    Garson Girişi
                </h1>
                <p className="text-gray-500 text-lg">
                    Hesabınıza giriş yapın
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {apiError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-red-800 font-medium">{apiError}</span>
                    </div>
                )}
                {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}


                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Kullanıcı Adı</label>
                    <input
                        type="text"
                        {...register("username")}
                        placeholder="Kullanıcı adınız"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#e11383] focus:ring-4 focus:ring-[#e11383]/10 transition-all font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Şifre</label>
                    <input
                        type="password"
                        {...register("password")}
                        placeholder="••••••••"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#e11383] focus:ring-4 focus:ring-[#e11383]/10 transition-all font-medium"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#e11383] hover:bg-[#c00f6f] text-white rounded-2xl font-bold text-lg shadow-[0_4px_14px_0_rgba(225,19,131,0.39)] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isSubmitting ? (
                            <span className="loading loading-spinner loading-md text-white"></span>
                        ) : (
                            'Giriş Yap'
                        )}
                    </button>
                </div>
            </form>
            
             <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                    Sistem Yöneticisi ile iletişime geçin.
                </p>
            </div>
        </div>
    </div>
  );
}

