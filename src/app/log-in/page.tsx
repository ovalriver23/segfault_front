"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

const SignInSchema = z.object({
  username: z.string().trim().min(1, "Kullanıcı adı gereklidir."),
  password: z.string().min(1, "Şifre gereklidir."),
});

type SignInFormData = z.infer<typeof SignInSchema>;
type ForgotStep = "email" | "reset" | "success";

const charactersData = [
  { key: "shawarma", img: "/images/Shawarma.webp", alt: "Dürüm maskotu", style: { zIndex: 1, left: "-9%", bottom: "-3%", width: "400px" }, eyes: { top: 173, left: 180 }, speed: 0.03 },
  { key: "fries", img: "/images/Fri.webp", alt: "Patates maskotu", style: { zIndex: 2, left: "48%", bottom: "5px", width: "240px" }, eyes: { top: 80, left: 95 }, speed: 0.05 },
  { key: "hamburger", img: "/images/Ham.webp", alt: "Hamburger maskotu", style: { zIndex: 4, left: "34%", bottom: "0", width: "180px" }, eyes: { top: 48, left: 75 }, speed: 0.04 },
  { key: "pizza", img: "/images/Pizza.webp", alt: "Pizza maskotu", style: { zIndex: 3, left: "-12%", bottom: "0", width: "280px" }, eyes: { top: 115, left: 110 }, speed: 0.06 },
];

const fieldBaseClass = "h-12 w-full rounded-xl border bg-white px-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-secondary-500 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";
const inputClass = (hasError: boolean) => `${fieldBaseClass} pl-11 ${hasError ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-gray-200"}`;
const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export default function SignInPage() {
  const router = useRouter();
  const charsRef = useRef<Array<HTMLDivElement | null>>([]);
  const redirectTimerRef = useRef<number | null>(null);
  const lookingAway = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (lookingAway.current) return;
      charsRef.current.forEach((character, index) => {
        if (!character) return;
        const rect = character.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const speed = charactersData[index].speed;
        character.style.translate = `${(event.clientX - centerX) * speed}px ${(event.clientY - centerY) * speed}px`;
        character.querySelectorAll<HTMLElement>("[data-pupil]").forEach((pupil) => {
          const eye = pupil.parentElement;
          if (!eye) return;
          const eyeRect = eye.getBoundingClientRect();
          const angle = Math.atan2(event.clientY - (eyeRect.top + eyeRect.height / 2), event.clientX - (eyeRect.left + eyeRect.width / 2));
          const distance = Math.min(3, Math.hypot(event.clientX - centerX, event.clientY - centerY) / 50);
          pupil.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        });
      });
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    lookingAway.current = showPassword;
    const directions = ["-3px, 0", "0, -3px", "0, 3px", "3px, 0"];
    charsRef.current.forEach((character, index) => {
      if (!character) return;
      character.style.rotate = showPassword ? `${index % 2 === 0 ? -5 : 5}deg` : "0deg";
      character.querySelectorAll<HTMLElement>("[data-pupil]").forEach((pupil) => {
        pupil.style.transform = showPassword ? `translate(${directions[index]})` : "translate(0, 0)";
      });
    });
  }, [showPassword]);

  useEffect(() => {
    if (!showForgotModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !forgotLoading) setShowForgotModal(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showForgotModal, forgotLoading]);

  useEffect(() => () => {
    if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
  }, []);

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotCode("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setForgotMessage("");
    setForgotError("");
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Bir hata oluştu.");
      setForgotMessage(data.message || "Doğrulama kodu e-posta adresinize gönderildi.");
      setForgotStep("reset");
    } catch (error: unknown) {
      setForgotError(getErrorMessage(error, "Bir hata oluştu."));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotError("");
    if (newPassword !== confirmPassword) {
      setForgotError("Şifreler eşleşmiyor.");
      return;
    }
    setForgotLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode, newPassword, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Bir hata oluştu.");
      setForgotMessage(data.message || "Şifreniz başarıyla değiştirildi.");
      setForgotStep("success");
    } catch (error: unknown) {
      setForgotError(getErrorMessage(error, "Bir hata oluştu."));
    } finally {
      setForgotLoading(false);
    }
  };

  const onSubmit = async (data: SignInFormData) => {
    setApiError("");
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        setApiError(responseData.error || responseData.message || "Giriş yapılamadı. Lütfen tekrar deneyin.");
        return;
      }
      setUserRole(responseData.role);
      setShowSuccess(true);
      redirectTimerRef.current = window.setTimeout(() => {
        if (responseData.role === "SUPER_ADMIN") router.replace("/Superadmin");
        else if (responseData.role === "STAFF") router.replace("/waiter/tables");
        else router.replace("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Sign-in error:", error);
      setApiError("Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const isBannedError = apiError.includes("BANLI") || apiError.toLocaleLowerCase("tr-TR").includes("yasaklandı");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fffaf6] px-4 py-6 text-gray-900 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-primary-200/45 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-36 bottom-10 h-96 w-96 rounded-full bg-secondary-100/60 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <Link href="/" className="group inline-flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500" aria-label="EasyOrder ana sayfa">
            <span className="text-2xl font-bold tracking-[-0.03em] text-gray-950 sm:text-[1.7rem]">EasyOrder</span>
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-secondary-500 transition-transform motion-safe:group-hover:scale-125" aria-hidden="true" />
          </Link>
          <Link href="/sign-up" className="rounded-lg px-2 py-2 text-right text-sm font-bold text-gray-600 transition hover:bg-white hover:text-secondary-600 focus-visible:outline-2 focus-visible:outline-secondary-500">
            <span className="hidden sm:inline">Henüz hesabınız yok mu? </span><span className="text-secondary-600">Kayıt olun</span>
          </Link>
        </header>

        <main className="grid overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_28px_80px_-42px_rgba(104,56,23,0.45)] lg:grid-cols-[0.46fr_0.54fr]">
          <aside className="relative grid min-h-[310px] overflow-hidden bg-[#f4a261] px-6 py-8 sm:px-9 lg:min-h-[690px] lg:grid-rows-[auto_1fr] lg:px-10 lg:py-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-secondary-500" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-4/5 -skew-x-12 bg-primary-300/55" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-2/3 bg-secondary-500" aria-hidden="true" />

            <div className="relative z-20 max-w-md pr-24 sm:pr-36 lg:pr-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-3 py-1.5 text-sm font-bold text-orange-800 shadow-sm"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Güvenli giriş</span>
              <h1 className="mt-5 max-w-sm text-3xl font-bold leading-tight tracking-[-0.025em] text-gray-950 sm:text-4xl">Tekrar hoş geldiniz.</h1>
              <p className="mt-4 hidden max-w-md leading-7 text-gray-700 sm:block">Restoranınızı yönetmeye kaldığınız yerden devam edin. EasyOrder ekibi sizi burada bekliyor.</p>
            </div>

            <div className="pointer-events-none absolute bottom-7 right-0 z-10 h-44 w-60 sm:bottom-5 sm:right-7 sm:h-56 sm:w-80 lg:relative lg:bottom-auto lg:right-auto lg:mt-3 lg:h-auto lg:min-h-[410px] lg:w-full lg:-translate-y-3">
              <div className="absolute inset-x-0 bottom-0 top-4 rounded-t-[999px] border border-white/75 bg-[#fff5e8]/70 lg:inset-x-1 lg:top-7" aria-hidden="true" />
              <div className="absolute bottom-4 left-1/2 h-3 w-3/5 -translate-x-1/2 rounded-full bg-orange-950/10 lg:bottom-8" aria-hidden="true" />
              <div className="absolute bottom-0 left-1/2 h-[220px] w-full max-w-[420px] -translate-x-1/2 lg:h-[400px]">
                {charactersData.map((character, index) => (
                  <div key={character.key} ref={(element) => { charsRef.current[index] = element; }} className={`character character-${character.key}`} style={{ position: "absolute", zIndex: character.style.zIndex, left: character.style.left, bottom: character.style.bottom, width: character.style.width, transition: "translate 180ms ease-out, rotate 300ms ease-out" }}>
                    <div className="mascot-float" style={{ animationDuration: `${3 + index * 0.5}s`, animationDelay: `${index * -0.2}s` }}>
                      <Image src={character.img} alt={character.alt} width={400} height={400} className="h-auto w-full drop-shadow-[0_18px_18px_rgba(104,56,23,0.2)]" priority={index === 0} />
                      <span className="eyes" style={{ top: character.eyes.top, left: character.eyes.left }} aria-hidden="true"><span className="eye"><span data-pupil className="pupil" /></span><span className="eye"><span data-pupil className="pupil" /></span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex px-5 py-8 sm:px-8 sm:py-10 lg:min-h-[690px] lg:items-center lg:px-14 lg:py-12">
            <div className="mx-auto w-full max-w-md">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-secondary-600">Hesabınıza giriş yapın</p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">Hoş geldiniz</h2>
              <p className="mt-3 leading-7 text-gray-600">Panelinize ulaşmak için kullanıcı bilgilerinizi girin.</p>

              {apiError && <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${isBannedError ? "border-orange-300 bg-orange-50 text-orange-900" : "border-red-200 bg-red-50 text-red-700"}`} role="alert">{isBannedError && <p className="mb-1 font-bold">Hesabınıza erişilemiyor</p>}<p className="font-medium">{apiError.replace("BANLI :", "").replace("BANLI:", "").trim()}</p></div>}
              {showSuccess && <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><div><p className="font-bold">Giriş başarılı</p><p className="mt-1">{userRole === "STAFF" ? "Personel ekranına" : "Panelinize"} yönlendiriliyorsunuz...</p></div></div>}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-5">
                <div>
                  <label htmlFor="username" className="mb-2 block text-sm font-bold text-gray-800">Kullanıcı adı</label>
                  <div className="relative"><UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" /><input id="username" type="text" autoComplete="username" placeholder="Kullanıcı adınız" disabled={isSubmitting || showSuccess} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? "username-error" : undefined} className={inputClass(Boolean(errors.username))} {...register("username")} /></div>
                  {errors.username && <p id="username-error" className="mt-2 text-sm font-medium text-red-600" role="alert">{errors.username.message}</p>}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="password" className="text-sm font-bold text-gray-800">Şifre</label><button type="button" onClick={() => setShowForgotModal(true)} className="rounded-md text-sm font-bold text-secondary-600 transition hover:text-secondary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">Şifremi unuttum</button></div>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Şifreniz" disabled={isSubmitting || showSuccess} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className={`${inputClass(Boolean(errors.password))} pr-12`} {...register("password")} />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-secondary-500" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}>{showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}</button>
                  </div>
                  {errors.password && <p id="password-error" className="mt-2 text-sm font-medium text-red-600" role="alert">{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting || showSuccess} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary-500 px-6 font-bold text-white shadow-lg shadow-pink-200/60 transition hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">{isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : <LogIn className="h-5 w-5" aria-hidden="true" />}{isSubmitting ? "Giriş yapılıyor" : "Giriş yap"}</button>
              </form>

              <div className="mt-7 border-t border-gray-100 pt-6 text-center text-sm text-gray-600">EasyOrder&apos;a yeni misiniz? <Link href="/sign-up" className="font-bold text-secondary-600 transition hover:text-secondary-700">Restoranınızı kaydedin <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" /></Link></div>
            </div>
          </section>
        </main>
      </div>

      <style jsx>{`
        .character { transform: scale(0.55); transform-origin: bottom left; }
        .mascot-float { position: relative; animation: mascot-float 3s ease-in-out infinite; }
        .eyes { position: absolute; display: flex; gap: 8px; pointer-events: none; }
        .eye { position: relative; display: block; width: 12px; height: 12px; border-radius: 999px; background: #171717; }
        .pupil { position: absolute; top: 3px; left: 3px; display: block; width: 6px; height: 6px; border-radius: 999px; background: #fff; transition: transform 100ms ease; }
        .character-pizza .eye { width: 15px; height: 15px; background: #fff; }
        .character-pizza .pupil { top: 3.5px; left: 3.5px; width: 8px; height: 8px; background: #171717; }
        @keyframes mascot-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @media (min-width: 768px) { .character { transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) { .mascot-float { animation: none; } .character, .pupil { transition: none !important; } }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px white inset !important; -webkit-text-fill-color: #111827 !important; transition: background-color 5000s ease-in-out 0s; }
      `}</style>

      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/65 px-4 py-8 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !forgotLoading) closeForgotModal(); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="forgot-title" aria-describedby="forgot-description" className="relative max-h-full w-full max-w-md overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
            <button type="button" onClick={closeForgotModal} disabled={forgotLoading} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-secondary-500" aria-label="Şifre sıfırlama penceresini kapat"><X className="h-5 w-5" aria-hidden="true" /></button>
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${forgotStep === "success" ? "bg-green-100 text-green-700" : "bg-pink-100 text-secondary-600"}`}>{forgotStep === "success" ? <CheckCircle2 className="h-7 w-7" aria-hidden="true" /> : <KeyRound className="h-7 w-7" aria-hidden="true" />}</div>
            <h2 id="forgot-title" className="mt-5 pr-10 text-2xl font-bold tracking-tight text-gray-950">{forgotStep === "email" && "Şifrenizi sıfırlayın"}{forgotStep === "reset" && "Yeni şifrenizi belirleyin"}{forgotStep === "success" && "Şifreniz değiştirildi"}</h2>
            <p id="forgot-description" className="mt-2 leading-7 text-gray-600">{forgotStep === "email" && "Hesabınıza bağlı e-posta adresine doğrulama kodu gönderelim."}{forgotStep === "reset" && "E-postanıza gelen altı haneli kodu ve yeni şifrenizi girin."}{forgotStep === "success" && "Artık yeni şifrenizle hesabınıza giriş yapabilirsiniz."}</p>
            {forgotError && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{forgotError}</div>}

            {forgotStep === "email" && <form onSubmit={handleForgotPassword} className="mt-6 space-y-5"><div><label htmlFor="forgot-email" className="mb-2 block text-sm font-bold text-gray-800">E-posta adresi</label><div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" /><input id="forgot-email" type="email" autoComplete="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} placeholder="ornek@restoran.com" className={inputClass(false)} required autoFocus /></div></div><button type="submit" disabled={forgotLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary-500 px-5 font-bold text-white transition hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">{forgotLoading && <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />}{forgotLoading ? "Kod gönderiliyor" : "Doğrulama kodu gönder"}</button></form>}

            {forgotStep === "reset" && (
              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{forgotMessage}</div>
                <div><label htmlFor="forgot-code" className="mb-2 block text-sm font-bold text-gray-800">Doğrulama kodu</label><input id="forgot-code" type="text" inputMode="numeric" autoComplete="one-time-code" value={forgotCode} onChange={(event) => setForgotCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className={`${fieldBaseClass} text-center font-bold tracking-[0.35em]`} required autoFocus /></div>
                <div><label htmlFor="new-password" className="mb-2 block text-sm font-bold text-gray-800">Yeni şifre</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" /><input id="new-password" type={showNewPassword ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Yeni şifreniz" className={`${inputClass(false)} pr-12`} required /><button type="button" onClick={() => setShowNewPassword((visible) => !visible)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-secondary-500" aria-label={showNewPassword ? "Yeni şifreyi gizle" : "Yeni şifreyi göster"}>{showNewPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}</button></div></div>
                <div><label htmlFor="confirm-password" className="mb-2 block text-sm font-bold text-gray-800">Şifre tekrarı</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" /><input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Şifrenizi tekrar girin" className={inputClass(false)} required /></div></div>
                <button type="submit" disabled={forgotLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary-500 px-5 font-bold text-white transition hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">{forgotLoading && <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />}{forgotLoading ? "Şifre değiştiriliyor" : "Şifreyi değiştir"}</button>
              </form>
            )}

            {forgotStep === "success" && <div className="mt-6">{forgotMessage && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{forgotMessage}</div>}<button type="button" onClick={closeForgotModal} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary-500 px-5 font-bold text-white transition hover:bg-secondary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">Giriş ekranına dön <ArrowRight className="h-4 w-4" aria-hidden="true" /></button></div>}
          </div>
        </div>
      )}
    </div>
  );
}
