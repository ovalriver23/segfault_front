"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as z from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleUserRound,
  Eye,
  EyeOff,
  LoaderCircle,
  LocateFixed,
  LockKeyhole,
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  Store,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { getUserLocation } from "../lib/utils/geolocation";

const LocationPicker = dynamic(() => import("../../components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 text-sm font-medium text-gray-500">
      <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-secondary-500" aria-hidden="true" />
      Harita yükleniyor...
    </div>
  ),
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const coordinateSchema = (label: string, min: number, max: number) =>
  z
    .string()
    .min(1, `${label} bilgisi gereklidir.`)
    .refine((value) => !Number.isNaN(Number(value)), `${label} bilgisi geçersiz.`)
    .refine((value) => Number(value) >= min && Number(value) <= max, `${label} bilgisi geçersiz.`);

const signUpSchema = z
  .object({
    userName: z.string().trim().min(1, "Kullanıcı adı gereklidir."),
    email: z.string().trim().email("Geçerli bir e-posta adresi girin."),
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter uzunluğunda olmalıdır.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
        "Şifre tüm güvenlik koşullarını karşılamalıdır.",
      ),
    confirmPassword: z.string().min(1, "Şifrenizi tekrar girin."),
    restaurantName: z.string().trim().min(1, "Restoran adı gereklidir."),
    restaurantLocation: z.string().trim().min(1, "Restoran adresi gereklidir."),
    latitude: coordinateSchema("Enlem", -90, 90),
    longitude: coordinateSchema("Boylam", -180, 180),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;
type UploadKind = "profilePhoto" | "restaurantLogo";

const steps: Array<{
  title: string;
  shortTitle: string;
  description: string;
  fields: Array<keyof SignUpFormData>;
}> = [
  {
    title: "Hesap bilgilerinizi oluşturun",
    shortTitle: "Hesap",
    description: "Başvurunuzu takip etmek için kullanacağınız giriş bilgilerini belirleyin.",
    fields: ["userName", "email", "password", "confirmPassword"],
  },
  {
    title: "Restoranınızı tanıyalım",
    shortTitle: "Restoran",
    description: "İşletmenizin temel bilgilerini ve dilerseniz görsellerini ekleyin.",
    fields: ["restaurantName", "restaurantLocation"],
  },
  {
    title: "Restoran konumunu seçin",
    shortTitle: "Konum",
    description: "Haritadan işletmenizin konumunu işaretleyin veya mevcut konumunuzu kullanın.",
    fields: ["latitude", "longitude"],
  },
  {
    title: "Bilgilerinizi kontrol edin",
    shortTitle: "Kontrol",
    description: "Başvuruyu göndermeden önce verdiğiniz bilgileri son kez gözden geçirin.",
    fields: [],
  },
];

const stepMascots = [
  {
    src: "/images/Shawarma.webp",
    alt: "Neşeli dürüm maskotu",
    size: "w-[74%] max-w-[300px]",
    eyes: { top: "45.5%", left: "44.5%", eyeSize: 12, pupilSize: 6, eyeColor: "#171717", pupilColor: "#ffffff" },
  },
  {
    src: "/images/Fri.webp",
    alt: "Neşeli patates maskotu",
    size: "w-[78%] max-w-[315px]",
    eyes: { top: "35.5%", left: "39%", eyeSize: 12, pupilSize: 6, eyeColor: "#171717", pupilColor: "#ffffff" },
  },
  {
    src: "/images/Ham.webp",
    alt: "Neşeli hamburger maskotu",
    size: "w-[82%] max-w-[330px]",
    eyes: { top: "29%", left: "41%", eyeSize: 12, pupilSize: 6, eyeColor: "#171717", pupilColor: "#ffffff" },
  },
  {
    src: "/images/Pizza-no-mouth.webp",
    alt: "Neşeli pizza maskotu",
    size: "w-[88%] max-w-[350px]",
    eyes: { top: "43.5%", left: "38.75%", eyeSize: 15, pupilSize: 8, eyeColor: "#ffffff", pupilColor: "#171717" },
  },
];

const fieldBaseClass =
  "h-12 w-full rounded-xl border bg-white px-4 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-secondary-500 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

const inputClass = (hasError: boolean) =>
  `${fieldBaseClass} pl-11 ${hasError ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-gray-200"}`;

const validateImageFile = (file: File) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Yalnızca JPEG, PNG, GIF veya WebP dosyaları yükleyebilirsiniz.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Dosya boyutu 5 MB'dan küçük olmalıdır.";
  }
  return null;
};

export default function SignUpPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [highestStep, setHighestStep] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [celebratingStep, setCelebratingStep] = useState<number | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [restaurantLogo, setRestaurantLogo] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [restaurantLogoPreview, setRestaurantLogoPreview] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Partial<Record<UploadKind, string>>>({});

  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const restaurantLogoRef = useRef<HTMLInputElement>(null);
  const successButtonRef = useRef<HTMLButtonElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      restaurantName: "",
      restaurantLocation: "",
      latitude: "",
      longitude: "",
    },
  });

  const values = watch();
  const progress = ((currentStep + 1) / steps.length) * 100;
  const passwordChecks = [
    { label: "En az 8 karakter", valid: values.password.length >= 8 },
    { label: "Büyük ve küçük harf", valid: /[A-Z]/.test(values.password) && /[a-z]/.test(values.password) },
    { label: "En az bir rakam", valid: /\d/.test(values.password) },
    { label: "En az bir özel karakter", valid: /[^a-zA-Z0-9]/.test(values.password) },
  ];

  useEffect(() => {
    return () => {
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
    };
  }, [profilePhotoPreview]);

  useEffect(() => {
    return () => {
      if (restaurantLogoPreview) URL.revokeObjectURL(restaurantLogoPreview);
    };
  }, [restaurantLogoPreview]);

  useEffect(() => {
    if (!showSuccess) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    successButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showSuccess]);

  useEffect(() => {
    const mascot = mascotRef.current;
    if (!mascot) return;

    const pupils = mascot.querySelectorAll<HTMLElement>("[data-mascot-pupil]");
    const passwordIsVisible = showPassword || showConfirmPassword;

    const movePupils = (clientX: number, clientY: number) => {
      pupils.forEach((pupil) => {
        const eye = pupil.parentElement;
        if (!eye) return;
        const eyeRect = eye.getBoundingClientRect();
        const eyeX = eyeRect.left + eyeRect.width / 2;
        const eyeY = eyeRect.top + eyeRect.height / 2;
        const angle = Math.atan2(clientY - eyeY, clientX - eyeX);
        const distance = Math.min(3, Math.hypot(clientX - eyeX, clientY - eyeY) / 45);
        pupil.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
      });
    };

    if (passwordIsVisible) {
      pupils.forEach((pupil) => {
        pupil.style.transform = "translate(-3px, 0)";
      });
      return;
    }

    pupils.forEach((pupil) => {
      pupil.style.transform = "translate(0, 0)";
    });

    if (prefersReducedMotion) return;

    const handlePointerMove = (event: PointerEvent) => movePupils(event.clientX, event.clientY);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [currentStep, prefersReducedMotion, showConfirmPassword, showPassword]);

  useEffect(() => {
    if (celebratingStep === null) return;
    const timer = window.setTimeout(() => setCelebratingStep(null), 850);
    return () => window.clearTimeout(timer);
  }, [celebratingStep]);

  const focusStepHeading = () => {
    window.requestAnimationFrame(() => stepHeadingRef.current?.focus());
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex > highestStep || isSubmitting) return;
    setGeneralError("");
    setReviewError("");
    setCelebratingStep(null);
    if (stepIndex < steps.length - 1) setReviewConfirmed(false);
    setCurrentStep(stepIndex);
    focusStepHeading();
  };

  const handleNext = async () => {
    setGeneralError("");
    const isStepValid = await trigger(steps[currentStep].fields, { shouldFocus: true });
    if (!isStepValid) return;

    const nextStep = Math.min(currentStep + 1, steps.length - 1);
    setCelebratingStep(nextStep);
    setHighestStep((step) => Math.max(step, nextStep));
    setCurrentStep(nextStep);
    focusStepHeading();
  };

  const handleBack = () => {
    setGeneralError("");
    setReviewError("");
    setCelebratingStep(null);
    setReviewConfirmed(false);
    setCurrentStep((step) => Math.max(0, step - 1));
    focusStepHeading();
  };

  const handleImageChange = (kind: UploadKind, file?: File) => {
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      setUploadErrors((current) => ({ ...current, [kind]: error }));
      const input = kind === "profilePhoto" ? profilePhotoRef.current : restaurantLogoRef.current;
      if (input) input.value = "";
      return;
    }

    setUploadErrors((current) => ({ ...current, [kind]: undefined }));
    const preview = URL.createObjectURL(file);
    if (kind === "profilePhoto") {
      setProfilePhoto(file);
      setProfilePhotoPreview(preview);
    } else {
      setRestaurantLogo(file);
      setRestaurantLogoPreview(preview);
    }
  };

  const removeImage = (kind: UploadKind) => {
    setUploadErrors((current) => ({ ...current, [kind]: undefined }));
    if (kind === "profilePhoto") {
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
      if (profilePhotoRef.current) profilePhotoRef.current.value = "";
    } else {
      setRestaurantLogo(null);
      setRestaurantLogoPreview(null);
      if (restaurantLogoRef.current) restaurantLogoRef.current.value = "";
    }
  };

  const handleLocationSelect = (latitude: string, longitude: string) => {
    setValue("latitude", latitude, { shouldDirty: true, shouldValidate: true });
    setValue("longitude", longitude, { shouldDirty: true, shouldValidate: true });
    clearErrors(["latitude", "longitude"]);
    setGeneralError("");
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setGeneralError("");
    try {
      const coordinates = await getUserLocation();
      handleLocationSelect(coordinates.latitude.toFixed(6), coordinates.longitude.toFixed(6));
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "Konumunuz alınamadı.";
      setGeneralError(message || "Konumunuz alınamadı.");
    } finally {
      setIsLocating(false);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    setGeneralError("");
    const formData = new FormData();
    formData.append("username", data.userName.trim());
    formData.append("email", data.email.trim());
    formData.append("password", data.password);
    formData.append("restaurantName", data.restaurantName.trim());
    formData.append("restaurantLocation", data.restaurantLocation.trim());
    formData.append("latitude", data.latitude);
    formData.append("longitude", data.longitude);
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);
    if (restaurantLogo) formData.append("restaurantLogo", restaurantLogo);

    try {
      const response = await fetch("/api/auth/signup", { method: "POST", body: formData });
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        setGeneralError(responseData.error || responseData.message || "Başvuru gönderilemedi. Lütfen tekrar deneyin.");
        return;
      }

      setShowSuccess(true);
    } catch {
      setGeneralError("Ağ bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.");
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Never allow an implicit submit (for example Enter or a reconciled button)
    // to bypass the review step.
    if (currentStep !== steps.length - 1) {
      void handleNext();
      return;
    }

    if (!reviewConfirmed) {
      setReviewError("Başvuruyu göndermeden önce bilgilerin doğru olduğunu onaylayın.");
      return;
    }

    setReviewError("");
    void handleSubmit(onSubmit)(event);
  };

  const renderUploadCard = (
    kind: UploadKind,
    label: string,
    description: string,
    preview: string | null,
    file: File | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    const inputId = `${kind}-input`;
    const errorId = `${kind}-error`;
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-gray-900">{label}</p>
            <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-500 shadow-sm">Opsiyonel</span>
        </div>

        {preview ? (
          <div className="relative h-40 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <Image src={preview} alt={`${label} önizlemesi`} fill unoptimized className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-white">
              <span className="min-w-0 truncate text-sm font-medium">{file?.name}</span>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => inputRef.current?.click()} disabled={isSubmitting} className="inline-flex h-9 items-center justify-center rounded-lg bg-white/95 px-3 text-xs font-bold text-gray-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Değiştir
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(kind)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-gray-800 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-label={`${label} görselini kaldır`}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isSubmitting}
            aria-describedby={uploadErrors[kind] ? errorId : undefined}
            className={`flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed bg-white px-4 text-center transition hover:border-secondary-400 hover:bg-pink-50/40 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500 ${uploadErrors[kind] ? "border-red-400" : "border-orange-300"}`}
          >
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Upload className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-semibold text-gray-800">Görsel seçin</span>
            <span className="mt-1 text-sm text-gray-500">JPEG, PNG, GIF veya WebP · Maks. 5 MB</span>
          </button>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(event) => handleImageChange(kind, event.target.files?.[0])}
          aria-describedby={uploadErrors[kind] ? errorId : undefined}
          disabled={isSubmitting}
        />
        {uploadErrors[kind] && (
          <p id={errorId} className="mt-2 text-sm font-medium text-red-600" role="alert">
            {uploadErrors[kind]}
          </p>
        )}
      </div>
    );
  };

  const activeMascot = stepMascots[currentStep];
  const mascotIsCelebrating = celebratingStep === currentStep;

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
          <Link href="/log-in" className="rounded-lg px-2 py-2 text-right text-sm font-bold text-gray-600 transition hover:bg-white hover:text-secondary-600 focus-visible:outline-2 focus-visible:outline-secondary-500">
            <span className="hidden sm:inline">Zaten hesabınız var mı? </span><span className="text-secondary-600">Giriş yapın</span>
          </Link>
        </header>

        <main className="grid overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_28px_80px_-42px_rgba(104,56,23,0.45)] lg:grid-cols-[0.36fr_0.64fr]" aria-hidden={showSuccess}>
          <aside className="relative grid min-h-[280px] overflow-hidden bg-[#f4a261] px-6 py-8 sm:px-9 lg:min-h-[720px] lg:grid-rows-[auto_1fr] lg:px-10 lg:py-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-secondary-500" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-4/5 -skew-x-12 bg-primary-300/55" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-2/3 bg-secondary-500" aria-hidden="true" />

            <div className="relative z-10 max-w-md pr-28 sm:pr-40 lg:pr-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-3 py-1.5 text-sm font-bold text-orange-800 shadow-sm">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Adım {String(currentStep + 1).padStart(2, "0")}
              </span>
              <h1 className="mt-5 max-w-sm text-3xl font-bold leading-tight tracking-[-0.025em] text-gray-950 sm:text-4xl">Restoranınızı dijital siparişe hazırlayın.</h1>
              <p className="mt-4 hidden max-w-md leading-7 text-gray-700 sm:block">Bilgilerinizi adım adım tamamlayın. Kayıt olduktan sonra ekibimiz başvuruyu inceleyecektir. Hesabınız onaylandıktan sonra sisteme erişiminiz açılacaktır.</p>
            </div>

            <div className="pointer-events-none absolute bottom-8 right-3 z-0 flex h-44 w-36 items-center justify-center sm:bottom-8 sm:right-8 sm:h-56 sm:w-48 lg:relative lg:bottom-auto lg:right-auto lg:mt-2 lg:h-auto lg:min-h-[420px] lg:w-full lg:-translate-y-6 lg:items-center">
              <div className="absolute inset-x-0 bottom-0 top-5 rounded-t-[999px] border border-white/75 bg-[#fff5e8]/70 lg:inset-x-1 lg:top-8" aria-hidden="true" />
              <div className="absolute bottom-5 left-1/2 h-3 w-3/5 -translate-x-1/2 rounded-full bg-orange-950/10 lg:bottom-10" aria-hidden="true" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentStep}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 110, rotate: 7, scale: 0.88 }}
                  animate={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : mascotIsCelebrating
                        ? { opacity: 1, x: 0, y: [0, -18, 0], rotate: [0, -6, 6, -3, 0], scale: [0.9, 1.1, 0.98, 1.04, 1] }
                        : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
                  }
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -110, rotate: -7, scale: 0.88 }}
                  transition={{ duration: prefersReducedMotion ? 0.15 : mascotIsCelebrating ? 0.72 : 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 flex h-full w-full items-center justify-center"
                >
                  <motion.div
                    ref={mascotRef}
                    animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
                    transition={prefersReducedMotion ? undefined : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`relative aspect-square ${activeMascot.size}`}
                  >
                    <Image src={activeMascot.src} alt={activeMascot.alt} fill sizes="(min-width: 1024px) 330px, 190px" className="object-contain drop-shadow-[0_22px_20px_rgba(104,56,23,0.2)]" priority={currentStep === 0} />
                    <span
                      className="absolute z-20 flex"
                      style={{ top: activeMascot.eyes.top, left: activeMascot.eyes.left, gap: 7 }}
                      aria-hidden="true"
                    >
                      {[0, 1].map((eye) => {
                        const eyeStyle = activeMascot.eyes;
                        const pupilOffset = (eyeStyle.eyeSize - eyeStyle.pupilSize) / 2;
                        return (
                          <span key={eye} className="relative block rounded-full" style={{ width: eyeStyle.eyeSize, height: eyeStyle.eyeSize, backgroundColor: eyeStyle.eyeColor }}>
                            <span
                              data-mascot-pupil
                              className="absolute block rounded-full transition-transform duration-100"
                              style={{ width: eyeStyle.pupilSize, height: eyeStyle.pupilSize, top: pupilOffset, left: pupilOffset, backgroundColor: eyeStyle.pupilColor }}
                            />
                          </span>
                        );
                      })}
                    </span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>

          <section className="px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="mb-8 lg:hidden">
              <div className="mb-2 flex items-center justify-between text-sm font-bold">
                <span className="text-secondary-600">Adım {currentStep + 1} / {steps.length}</span>
                <span className="text-gray-500">%{Math.round(progress)} tamamlandı</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={currentStep + 1} aria-label="Başvuru ilerlemesi">
                <div className="h-full rounded-full bg-linear-to-r from-primary-500 to-secondary-500 transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ol className="mb-10 hidden grid-cols-4 gap-2 lg:grid" aria-label="Başvuru adımları">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep || index < highestStep;
                const isAvailable = index <= highestStep;
                return (
                  <li key={step.shortTitle}>
                    <button type="button" onClick={() => goToStep(index)} disabled={!isAvailable || isSubmitting} aria-current={isActive ? "step" : undefined} className="group w-full text-left disabled:cursor-not-allowed">
                      <span className={`mb-3 block h-1.5 rounded-full transition-colors ${isActive || isCompleted ? "bg-secondary-500" : "bg-gray-200"}`} />
                      <span className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${isActive ? "bg-secondary-500 text-white" : isCompleted ? "bg-pink-100 text-secondary-700" : "bg-gray-100 text-gray-400"}`}>
                          {isCompleted && !isActive ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : index + 1}
                        </span>
                        <span className={`text-sm font-bold ${isActive ? "text-gray-950" : "text-gray-500"}`}>{step.shortTitle}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mx-auto max-w-2xl">
              <div className="mb-7">
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-secondary-600">Adım {currentStep + 1}</p>
                <h2 ref={stepHeadingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight text-gray-950 outline-none sm:text-3xl">{steps[currentStep].title}</h2>
                <p className="mt-3 leading-7 text-gray-600">{steps[currentStep].description}</p>
              </div>

              <form onSubmit={handleFormSubmit} noValidate>
                {currentStep === 0 && (
                  <div className="space-y-5">
                    <FormField label="Kullanıcı adı" id="userName" error={errors.userName?.message} icon={<UserRound className="h-5 w-5" />}>
                      <input id="userName" type="text" autoComplete="username" placeholder="Örn. cafeamo" disabled={isSubmitting} aria-invalid={Boolean(errors.userName)} aria-describedby={errors.userName ? "userName-error" : undefined} className={inputClass(Boolean(errors.userName))} {...register("userName")} />
                    </FormField>

                    <FormField label="E-posta adresi" id="email" error={errors.email?.message} icon={<Mail className="h-5 w-5" />}>
                      <input id="email" type="email" autoComplete="email" placeholder="ornek@restoran.com" disabled={isSubmitting} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className={inputClass(Boolean(errors.email))} {...register("email")} />
                    </FormField>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField label="Şifre" id="password" error={errors.password?.message} icon={<LockKeyhole className="h-5 w-5" />}>
                        <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" disabled={isSubmitting} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error password-rules" : "password-rules"} className={`${inputClass(Boolean(errors.password))} pr-11`} {...register("password")} />
                        <PasswordToggle visible={showPassword} onClick={() => setShowPassword((visible) => !visible)} label="Şifre" />
                      </FormField>

                      <FormField label="Şifre tekrarı" id="confirmPassword" error={errors.confirmPassword?.message} icon={<LockKeyhole className="h-5 w-5" />}>
                        <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" disabled={isSubmitting} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined} className={`${inputClass(Boolean(errors.confirmPassword))} pr-11`} {...register("confirmPassword")} />
                        <PasswordToggle visible={showConfirmPassword} onClick={() => setShowConfirmPassword((visible) => !visible)} label="Şifre tekrarını" />
                      </FormField>
                    </div>

                    <div id="password-rules" className="grid gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2" aria-live="polite">
                      {passwordChecks.map((check) => (
                        <div key={check.label} className={`flex items-center gap-2 text-sm font-medium ${check.valid ? "text-green-700" : "text-gray-500"}`}>
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full ${check.valid ? "bg-green-100" : "bg-gray-200"}`}><Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" /></span>
                          {check.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField label="Restoran adı" id="restaurantName" error={errors.restaurantName?.message} icon={<Store className="h-5 w-5" />}>
                        <input id="restaurantName" type="text" autoComplete="organization" placeholder="Örn. Cafe Amo" disabled={isSubmitting} aria-invalid={Boolean(errors.restaurantName)} aria-describedby={errors.restaurantName ? "restaurantName-error" : undefined} className={inputClass(Boolean(errors.restaurantName))} {...register("restaurantName")} />
                      </FormField>
                      <FormField label="Adres / bölge" id="restaurantLocation" error={errors.restaurantLocation?.message} icon={<MapPin className="h-5 w-5" />}>
                        <input id="restaurantLocation" type="text" autoComplete="street-address" placeholder="Örn. Beşiktaş, İstanbul" disabled={isSubmitting} aria-invalid={Boolean(errors.restaurantLocation)} aria-describedby={errors.restaurantLocation ? "restaurantLocation-error" : undefined} className={inputClass(Boolean(errors.restaurantLocation))} {...register("restaurantLocation")} />
                      </FormField>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {renderUploadCard("restaurantLogo", "Restoran logosu", "Menünüzde ve yönetim panelinizde kullanılabilir.", restaurantLogoPreview, restaurantLogo, restaurantLogoRef)}
                      {renderUploadCard("profilePhoto", "Profil fotoğrafı", "Yönetici hesabınızı kişiselleştirir.", profilePhotoPreview, profilePhoto, profilePhotoRef)}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-700 shadow-sm"><LocateFixed className="h-5 w-5" aria-hidden="true" /></span>
                        <div><p className="font-bold text-gray-900">Hızlı konum seçimi</p><p className="mt-1 text-sm leading-5 text-gray-600">Tarayıcınızın konum iznini kullanabilirsiniz.</p></div>
                      </div>
                      <button type="button" onClick={handleUseCurrentLocation} disabled={isLocating || isSubmitting} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">
                        {isLocating ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="h-4 w-4" aria-hidden="true" />}
                        {isLocating ? "Konum alınıyor" : "Konumumu kullan"}
                      </button>
                    </div>

                    {generalError && <div className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-900" role="alert"><p className="font-bold">Konum alınamadı</p><p className="mt-1">{generalError} Haritaya dokunarak konumu manuel seçebilirsiniz.</p></div>}

                    <LocationPicker latitude={values.latitude} longitude={values.longitude} onChange={handleLocationSelect} />

                    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${values.latitude && values.longitude ? "border-green-200 bg-green-50 text-green-800" : errors.latitude || errors.longitude ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                      {values.latitude && values.longitude ? <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" /> : <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />}
                      <div className="min-w-0">
                        <p className="text-sm font-bold">{values.latitude && values.longitude ? "Konum seçildi" : "Haritadan bir konum seçin"}</p>
                        {values.latitude && values.longitude && <p className="mt-0.5 truncate text-sm">{values.latitude}, {values.longitude}</p>}
                        {(errors.latitude || errors.longitude) && <p className="mt-0.5 text-sm" role="alert">Restoran konumu gereklidir.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <ReviewCard icon={<CircleUserRound className="h-5 w-5" aria-hidden="true" />} title="Hesap bilgileri" onEdit={() => goToStep(0)}>
                      <p className="font-semibold text-gray-900">{values.userName}</p><p className="mt-1 break-all text-sm text-gray-600">{values.email}</p><p className="mt-2 text-sm text-gray-500">Şifreniz güvenli biçimde kaydedilecek.</p>
                    </ReviewCard>
                    <ReviewCard icon={<Store className="h-5 w-5" aria-hidden="true" />} title="Restoran bilgileri" onEdit={() => goToStep(1)}>
                      <p className="font-semibold text-gray-900">{values.restaurantName}</p><p className="mt-1 text-sm text-gray-600">{values.restaurantLocation}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-600"><span className="rounded-full bg-gray-100 px-2.5 py-1">{restaurantLogo ? "Logo eklendi" : "Logo eklenmedi"}</span><span className="rounded-full bg-gray-100 px-2.5 py-1">{profilePhoto ? "Profil fotoğrafı eklendi" : "Profil fotoğrafı eklenmedi"}</span></div>
                    </ReviewCard>
                    <ReviewCard icon={<MapPin className="h-5 w-5" aria-hidden="true" />} title="Restoran konumu" onEdit={() => goToStep(2)}>
                      <p className="font-semibold text-gray-900">Konum haritada işaretlendi</p><p className="mt-1 text-sm text-gray-600">{values.latitude}, {values.longitude}</p>
                    </ReviewCard>
                    <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 text-sm leading-6 text-orange-950"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-700" aria-hidden="true" /><p>Başvurunuz gönderildikten sonra ekibimiz restoran bilgilerinizi inceleyecek. Onay tamamlandığında giriş yapabilirsiniz.</p></div>
                    <div className={`rounded-2xl border p-4 ${reviewError ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={reviewConfirmed}
                          onChange={(event) => {
                            setReviewConfirmed(event.target.checked);
                            if (event.target.checked) setReviewError("");
                          }}
                          aria-invalid={Boolean(reviewError)}
                          aria-describedby={reviewError ? "review-confirmation-error" : undefined}
                          className="checkbox checkbox-sm mt-0.5 border-gray-300 [--chkbg:var(--color-secondary-500)] [--chkfg:white]"
                        />
                        <span className="text-sm font-semibold leading-6 text-gray-800">Yukarıdaki bilgilerin doğru olduğunu ve başvurunun incelemeye gönderilmesini onaylıyorum.</span>
                      </label>
                      {reviewError && <p id="review-confirmation-error" className="mt-2 pl-8 text-sm font-medium text-red-600" role="alert">{reviewError}</p>}
                    </div>
                  </div>
                )}

                {generalError && currentStep !== 2 && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{generalError}</div>}

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  {currentStep > 0 ? (
                    <button type="button" onClick={handleBack} disabled={isSubmitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 font-bold text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Geri</button>
                  ) : <span />}

                  {currentStep < steps.length - 1 ? (
                    <button key="next-step" type="button" onClick={(event) => { event.preventDefault(); void handleNext(); }} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary-500 px-6 font-bold text-white shadow-lg shadow-pink-200/60 transition hover:bg-secondary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">{currentStep === steps.length - 2 ? "Bilgileri kontrol et" : "Devam et"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                  ) : (
                    <button key="submit-application" type="submit" disabled={isSubmitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary-500 px-6 font-bold text-white shadow-lg shadow-pink-200/60 transition hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">
                      {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-5 w-5" aria-hidden="true" />}{isSubmitting ? "Başvuru gönderiliyor" : "Başvuruyu gönder"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/65 px-4 py-8 backdrop-blur-sm" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="success-title" aria-describedby="success-description" onKeyDown={(event) => { if (event.key === "Tab") { event.preventDefault(); successButtonRef.current?.focus(); } }} className="w-full max-w-md rounded-[2rem] bg-white p-7 text-center shadow-2xl sm:p-9">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700"><CheckCircle2 className="h-8 w-8" aria-hidden="true" /></div>
            <h2 id="success-title" className="mt-5 text-2xl font-bold tracking-tight text-gray-950">Başvurunuz alındı</h2>
            <p id="success-description" className="mt-3 leading-7 text-gray-600">Restoranınız manuel inceleme aşamasına alındı. Onay tamamlandıktan sonra hesabınızla giriş yapabilirsiniz.</p>
            <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-900">Durumu kontrol etmek istediğinizde giriş sayfasından hesabınızla giriş yapmayı deneyebilirsiniz.</div>
            <button ref={successButtonRef} type="button" onClick={() => router.replace("/")} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary-500 px-5 font-bold text-white transition hover:bg-secondary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500">Anladım, ana sayfaya dön<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, id, error, icon, children }: { label: string; id: string; error?: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-gray-800">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400" aria-hidden="true">{icon}</span>
        {children}
      </div>
      {error && <p id={`${id}-error`} className="mt-2 text-sm font-medium text-red-600" role="alert">{error}</p>}
    </div>
  );
}

function PasswordToggle({ visible, onClick, label }: { visible: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-secondary-500" aria-label={visible ? `${label} gizle` : `${label} göster`}>
      {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}

function ReviewCard({ icon, title, onEdit, children }: { icon: React.ReactNode; title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">{icon}</span><h3 className="font-bold text-gray-950">{title}</h3></div>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-bold text-secondary-600 transition hover:bg-pink-50 focus-visible:outline-2 focus-visible:outline-secondary-500"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Düzenle</button>
      </div>
      <div className="pl-[3.25rem]">{children}</div>
    </article>
  );
}
