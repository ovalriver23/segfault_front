// src/app/waiter/Login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function WaiterLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'reset' | 'success'>('email');
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  // Step 1: Request code
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Bir hata oluştu");
      }

      setForgotMessage(data.message || "Doğrulama kodu email adresinize gönderildi.");
      setForgotStep('reset');
    } catch (err: any) {
      setForgotError(err.message || "Bir hata oluştu");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Reset password with code
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    if (newPassword !== confirmPassword) {
      setForgotError("Şifreler eşleşmiyor");
      setForgotLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          code: forgotCode,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Bir hata oluştu");
      }

      setForgotMessage(data.message || "Şifreniz başarıyla değiştirildi.");
      setForgotStep('success');
    } catch (err: any) {
      setForgotError(err.message || "Bir hata oluştu");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('email');
    setForgotEmail("");
    setForgotCode("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotMessage("");
    setForgotError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Giriş başarısız");
      }

      // Check if user is staff (waiter)
      if (data.role !== "STAFF") {
        throw new Error("Bu giriş sadece personel içindir");
      }

      // Redirect to waiter dashboard
      router.push("/waiter/tables");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[393px] min-h-screen mx-auto bg-white overflow-hidden rounded-[30px]">
      {/* Logo Icons */}
      <div className="relative w-20 h-10 mt-[186px] mx-auto flex gap-0">
        {/* Coffee Cup Icon */}
        <div className="w-10 h-10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.3333 30C15.0833 30 12.3264 28.8681 10.0625 26.6042C7.79861 24.3403 6.66667 21.5833 6.66667 18.3333V8.33333C6.66667 7.41667 6.99306 6.63194 7.64583 5.97917C8.29861 5.32639 9.08333 5 10 5H30.8333C32.4444 5 33.8194 5.56944 34.9583 6.70833C36.0972 7.84722 36.6667 9.22222 36.6667 10.8333C36.6667 12.4444 36.0972 13.8194 34.9583 14.9583C33.8194 16.0972 32.4444 16.6667 30.8333 16.6667H30V18.3333C30 21.5833 28.8681 24.3403 26.6042 26.6042C24.3403 28.8681 21.5833 30 18.3333 30ZM10 13.3333H26.6667V8.33333H10V13.3333ZM18.3333 26.6667C20.6389 26.6667 22.6042 25.8542 24.2292 24.2292C25.8542 22.6042 26.6667 20.6389 26.6667 18.3333V16.6667H10V18.3333C10 20.6389 10.8125 22.6042 12.4375 24.2292C14.0625 25.8542 16.0278 26.6667 18.3333 26.6667ZM30 13.3333H30.8333C31.5278 13.3333 32.1181 13.0903 32.6042 12.6042C33.0903 12.1181 33.3333 11.5278 33.3333 10.8333C33.3333 10.1389 33.0903 9.54861 32.6042 9.0625C32.1181 8.57639 31.5278 8.33333 30.8333 8.33333H30V13.3333ZM6.66667 35V31.6667H33.3333V35H6.66667Z" fill="#E11383" />
          </svg>
        </div>

        {/* Croissant Icon */}
        <div className="w-10 h-10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M33.5 28.25C33.9722 28.5 34.3889 28.4444 34.75 28.0833C35.1111 27.7222 35.1667 27.3056 34.9167 26.8333L32.5 22.3333L30.75 26.8333L33.5 28.25ZM25.1667 26.6667H27.1667L31.1667 16.75C31.25 16.5278 31.2292 16.3403 31.1042 16.1875C30.9792 16.0347 30.8333 15.9167 30.6667 15.8333L27.3333 14.5C27.0833 14.4167 26.8403 14.4444 26.6042 14.5833C26.3681 14.7222 26.2222 14.9167 26.1667 15.1667L25.1667 26.6667ZM12.8333 26.6667H14.8333L13.8333 15.1667C13.7778 14.8611 13.6319 14.6528 13.3958 14.5417C13.1597 14.4306 12.9167 14.4167 12.6667 14.5L9.33333 15.8333C9.11111 15.9167 8.95139 16.0347 8.85417 16.1875C8.75694 16.3403 8.75 16.5278 8.83333 16.75L12.8333 26.6667ZM6.5 28.25L9.25 26.8333L7.5 22.3333L5.08333 26.8333C4.83333 27.3056 4.88889 27.7222 5.25 28.0833C5.61111 28.4444 6.02778 28.5 6.5 28.25ZM18.1667 26.6667H21.8333L23.0833 12.5833C23.1389 12.3333 23.0764 12.1181 22.8958 11.9375C22.7153 11.7569 22.5 11.6667 22.25 11.6667H17.75C17.5278 11.6667 17.3264 11.7569 17.1458 11.9375C16.9653 12.1181 16.8889 12.3333 16.9167 12.5833L18.1667 26.6667ZM5.75 31.6667C4.58333 31.6667 3.61111 31.2292 2.83333 30.3542C2.05555 29.4792 1.66667 28.4444 1.66667 27.25C1.66667 26.9167 1.71528 26.5903 1.8125 26.2708C1.90972 25.9514 2.02778 25.6389 2.16667 25.3333L5.83333 18.3333C5.44444 17.2222 5.45833 16.125 5.875 15.0417C6.29167 13.9583 7.02778 13.1944 8.08333 12.75L11.4167 11.4167C11.8056 11.2778 12.1944 11.1806 12.5833 11.125C12.9722 11.0694 13.3611 11.0833 13.75 11.1667C14.1389 10.3611 14.6806 9.6875 15.375 9.14584C16.0694 8.60417 16.8611 8.33334 17.75 8.33334H22.25C23.1389 8.33334 23.9306 8.60417 24.625 9.14584C25.3194 9.6875 25.8611 10.3611 26.25 11.1667C26.6389 11.1111 27.0278 11.1042 27.4167 11.1458C27.8056 11.1875 28.1944 11.2778 28.5833 11.4167L31.9167 12.75C33.0278 13.1944 33.8056 13.9583 34.25 15.0417C34.6944 16.125 34.6667 17.1944 34.1667 18.25L37.8333 25.25C38 25.5556 38.125 25.875 38.2083 26.2083C38.2917 26.5417 38.3333 26.8889 38.3333 27.25C38.3333 28.5 37.9097 29.5486 37.0625 30.3958C36.2153 31.2431 35.1667 31.6667 33.9167 31.6667C33.6111 31.6667 33.3056 31.6319 33 31.5625C32.6944 31.4931 32.3889 31.3889 32.0833 31.25L29.5 30H10.4167L8.08333 31.25C7.72222 31.4444 7.34028 31.5625 6.9375 31.6042C6.53472 31.6458 6.13889 31.6667 5.75 31.6667Z" fill="#F8A45A" />
          </svg>
        </div>
      </div>

      {/* Welcome Text */}
      <h1 className="text-[36px] font-semibold text-center text-black tracking-[-0.68px] leading-[37px] mt-0 mx-auto w-[181px]">
        Hoşgeldiniz!
      </h1>

      {/* Subtitle */}
      <p className="text-[16px] font-medium text-center text-black/60 tracking-[-0.3px] leading-6 mt-0 mx-auto w-[246px]">
        Vardiyanızı başlatmak için giriş yapınız
      </p>

      {/* Form */}
      <form onSubmit={handleLogin} className="w-[327px] mx-auto mt-[37px] flex flex-col gap-4">
        {/* Username Field */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[12px] font-medium text-[#6C7278] tracking-[-0.24px] leading-[19px]">
            Kullanıcı Adı
          </label>
          <div className="h-[46px] px-3.5 bg-white border border-[#F8A45A] rounded-[10px] shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] flex items-center">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ahmetcalik"
              className="w-full bg-transparent text-[14px] font-medium text-[#1A1C1E] tracking-[-0.14px] leading-[19.6px] outline-none"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[12px] font-medium text-[#6C7278] tracking-[-0.24px] leading-[19px]">
            Parola
          </label>
          <div className="h-[46px] px-3.5 bg-white border border-[#F8A45A] rounded-[10px] shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] flex items-center gap-2.5">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="*******"
              className="flex-1 bg-transparent text-[14px] font-medium text-[#1A1C1E] tracking-[-0.14px] leading-[19.6px] outline-none placeholder:translate-y-0.5"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="w-4 h-4 shrink-0"
            >
              {showPassword ? (
                // Eye (Visible) - Show this when password is visible
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#6C7278">
                  <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                </svg>
              ) : (
                // Eye Slash (Hidden) - Show this when password is hidden
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#6C7278">
                  <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <button
          type="button"
          onClick={() => setShowForgotModal(true)}
          className="text-[12px] font-semibold text-[#EB5FAB] tracking-[-0.12px] leading-[16.8px] text-right hover:underline"
        >
          Şifrenizi mi unuttunuz?
        </button>

        {/* Error Message */}
        {error && (
          <div className={`p-3 border rounded-lg text-sm ${error.includes('BANLI') || error.toLowerCase().includes('yasaklandı')
            ? 'bg-orange-50 border-orange-400 text-orange-800'
            : 'text-red-500 border-red-300 bg-red-50'
            }`}>
            {error.includes('BANLI') ? (
              <div>
                <div className="font-bold mb-1">⚠️ Hesap Yasaklandı</div>
                <div>{error.replace('BANLI :', '').replace('BANLI:', '').trim()}</div>
              </div>
            ) : (
              error
            )}
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#EB5FAB] rounded-[10px] shadow-[0_0_0_0_#51072F] flex items-center justify-center mt-4 hover:bg-[#d54f9a] transition-colors disabled:opacity-50"
        >
          <span className="text-[14px] font-medium text-white tracking-[-0.14px] leading-[19.6px]">
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </span>
        </button>
      </form>

      {/* Help Text */}
      <p className="text-[14px] font-medium text-black/60 tracking-[-0.14px] leading-[19.6px] text-center w-[327px] mx-auto mt-3.5">
        Yardım mı lazım? Yönetici ile iletişime geçin
      </p>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[350px] p-6 relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#FEF3F2] rounded-full flex items-center justify-center mx-auto mb-4">
                {forgotStep === 'success' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V12M12 9H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#EB5FAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {forgotStep === 'email' && 'Şifremi Unuttum'}
                {forgotStep === 'reset' && 'Yeni Şifre Belirle'}
                {forgotStep === 'success' && 'Şifre Değiştirildi!'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {forgotStep === 'email' && 'Email adresinizi girin, şifre sıfırlama kodu gönderelim'}
                {forgotStep === 'reset' && 'Email adresinize gelen kodu ve yeni şifrenizi girin'}
                {forgotStep === 'success' && 'Yeni şifrenizle giriş yapabilirsiniz'}
              </p>
            </div>

            {/* Error Message */}
            {forgotError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                {forgotError}
              </div>
            )}

            {/* Step 1: Email Form */}
            {forgotStep === 'email' && (
              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label className="text-[12px] font-medium text-[#6C7278] tracking-[-0.24px] leading-[19px] block mb-1">
                    Email Adresi
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full h-[46px] px-3.5 bg-white border border-[#F8A45A] rounded-[10px] text-[14px] font-medium text-[#1A1C1E] outline-none focus:border-[#EB5FAB] transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full h-12 bg-[#EB5FAB] rounded-[10px] flex items-center justify-center hover:bg-[#d54f9a] transition-colors disabled:opacity-50"
                >
                  <span className="text-[14px] font-medium text-white">
                    {forgotLoading ? "Gönderiliyor..." : "Kod Gönder"}
                  </span>
                </button>
              </form>
            )}

            {/* Step 2: Reset Password Form */}
            {forgotStep === 'reset' && (
              <form onSubmit={handleResetPassword}>
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs text-center">
                  ✓ Kod {forgotEmail} adresine gönderildi
                </div>

                <div className="mb-3">
                  <label className="text-[12px] font-medium text-[#6C7278] tracking-[-0.24px] leading-[19px] block mb-1">
                    Doğrulama Kodu (6 haneli)
                  </label>
                  <input
                    type="text"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full h-[46px] px-3.5 bg-white border border-[#F8A45A] rounded-[10px] text-[14px] font-medium text-[#1A1C1E] outline-none focus:border-[#EB5FAB] transition-colors text-center tracking-[0.5em]"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="text-[12px] font-medium text-[#6C7278] tracking-[-0.24px] leading-[19px] block mb-1">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Yeni şifrenizi girin"
                      className="w-full h-[46px] px-3.5 bg-white border border-[#F8A45A] rounded-[10px] text-[14px] font-medium text-[#1A1C1E] outline-none focus:border-[#EB5FAB] transition-colors pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#6C7278">
                          <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#6C7278">
                          <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[12px] font-medium text-[#6C7278] tracking-[-0.24px] leading-[19px] block mb-1">
                    Şifre Tekrar
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifrenizi tekrar girin"
                    className="w-full h-[46px] px-3.5 bg-white border border-[#F8A45A] rounded-[10px] text-[14px] font-medium text-[#1A1C1E] outline-none focus:border-[#EB5FAB] transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full h-12 bg-[#EB5FAB] rounded-[10px] flex items-center justify-center hover:bg-[#d54f9a] transition-colors disabled:opacity-50"
                >
                  <span className="text-[14px] font-medium text-white">
                    {forgotLoading ? "İşleniyor..." : "Şifreyi Değiştir"}
                  </span>
                </button>
              </form>
            )}

            {/* Step 3: Success */}
            {forgotStep === 'success' && (
              <button
                onClick={closeForgotModal}
                className="w-full h-12 bg-[#EB5FAB] rounded-[10px] flex items-center justify-center hover:bg-[#d54f9a] transition-colors"
              >
                <span className="text-[14px] font-medium text-white">Giriş Sayfasına Dön</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}