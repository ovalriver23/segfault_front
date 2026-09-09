"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  calculateDistance,
  GEOLOCATION_ERROR_CODE,
  getUserLocation,
  type GeolocationError,
  type LocationCoordinates,
} from "../../lib/utils/geolocation";
import {
  scanTable,
  type TableScanError,
  type TableScanResponse,
} from "../../lib/services/tableService";
import MenuView, { type ApiResponse } from "../../../components/MenuView";

const LOCATION_VALIDATION_INTERVAL_MS = 30_000;
const LOCATION_VALIDATION_RETRY_MS = 10_000;
const LOCATION_VALIDATION_GRACE_PERIOD_MS = 90_000;
const MAX_ALLOWED_DISTANCE_METERS = 100;
const BRANDED_INTRO_VISIBLE_MS = 700;
const BRANDED_INTRO_REDUCED_MOTION_VISIBLE_MS = 350;
// Leave room for the 300 ms exit transition so the menu is usable within 2 seconds.
const BRANDED_INTRO_TIMEOUT_MS = 1_700;

type ValidationError = {
  title: string;
  message: string;
  type: "location" | "scan";
  actionLabel: string;
  guidance?: string;
};

type DistanceValidationError = {
  kind: "distance";
  actualDistance: number;
};

const introThemeConfig = {
  DEFAULT: {
    background: "#fff8f2",
    glow: "rgba(248, 164, 90, 0.34)",
    accent: "#F8A45A",
    title: "text-gray-900",
    body: "text-gray-500",
    logoSurface: "bg-white ring-orange-100",
  },
  MODERN: {
    background: "#1f1f1f",
    glow: "rgba(234, 88, 12, 0.30)",
    accent: "#ea580c",
    title: "text-white",
    body: "text-gray-400",
    logoSurface: "bg-white ring-white/15",
  },
  ELEGANT: {
    background: "#f5f1e5",
    glow: "rgba(156, 102, 68, 0.28)",
    accent: "#9C6644",
    title: "text-[#5c4033] font-serif",
    body: "text-[#8b4513]/70 font-serif",
    logoSurface: "bg-[#fdfbf7] ring-[#d2b48c]",
  },
} satisfies Record<
  TableScanResponse["menuTheme"],
  {
    background: string;
    glow: string;
    accent: string;
    title: string;
    body: string;
    logoSurface: string;
  }
>;

function BrandedMenuIntro({
  logoUrl,
  restaurantName,
  theme,
  onFinish,
}: {
  logoUrl: string;
  restaurantName: string;
  theme: TableScanResponse["menuTheme"];
  onFinish: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const styles = introThemeConfig[theme] || introThemeConfig.DEFAULT;

  useEffect(() => {
    const timeout = window.setTimeout(onFinish, BRANDED_INTRO_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [onFinish]);

  useEffect(() => {
    if (!logoLoaded) return;

    const visibleDuration = shouldReduceMotion
      ? BRANDED_INTRO_REDUCED_MOTION_VISIBLE_MS
      : BRANDED_INTRO_VISIBLE_MS;
    const timeout = window.setTimeout(onFinish, visibleDuration);
    return () => window.clearTimeout(timeout);
  }, [logoLoaded, onFinish, shouldReduceMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] mx-auto flex min-h-[100dvh] max-w-md items-center justify-center overflow-hidden px-6 py-10 sm:rounded-3xl sm:shadow-2xl"
      style={{
        backgroundColor: styles.background,
        backgroundImage: `radial-gradient(circle at 50% 38%, ${styles.glow} 0%, transparent 48%)`,
      }}
      initial={shouldReduceMotion ? false : { opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" }}
      role="status"
      aria-live="polite"
      aria-label={`${restaurantName} menüsü hazırlanıyor`}
    >
      <div className="relative flex w-full flex-col items-center text-center">
        {!shouldReduceMotion && (
          <motion.div
            className="absolute top-0 h-36 w-36 rounded-full blur-2xl"
            style={{ backgroundColor: styles.glow }}
            animate={{ scale: [0.9, 1.12, 0.9], opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        )}

        <motion.div
          className={`relative h-28 w-28 overflow-hidden rounded-[1.75rem] shadow-xl ring-1 ${styles.logoSurface}`}
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {!logoLoaded && (
            <span
              className="loading loading-spinner loading-sm absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
              style={{ color: styles.accent }}
              aria-hidden="true"
            />
          )}
          <Image
            src={logoUrl}
            alt={`${restaurantName} logosu`}
            fill
            sizes="112px"
            priority
            className={`z-10 object-contain p-3 transition-opacity duration-300 ${logoLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLogoLoaded(true)}
            onError={onFinish}
          />
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: shouldReduceMotion ? 0 : 0.12 }}
        >
          <h1 className={`mt-7 max-w-xs truncate text-2xl font-semibold tracking-tight ${styles.title}`}>
            {restaurantName}
          </h1>
          <p className={`mt-2 text-sm ${styles.body}`}>Menünüz hazırlanıyor...</p>
        </motion.div>

        <div
          className="mt-6 h-1 w-28 overflow-hidden rounded-full"
          style={{ backgroundColor: styles.glow }}
          aria-hidden="true"
        >
          <motion.div
            className="h-full origin-left rounded-full"
            style={{ backgroundColor: styles.accent }}
            animate={
              shouldReduceMotion
                ? { scaleX: 0.65 }
                : { scaleX: [0.18, 1, 0.18], x: ["-20%", "0%", "80%"] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </div>
      </div>
    </motion.div>
  );
}

const isGeolocationError = (error: unknown): error is GeolocationError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "number" &&
    "message" in error &&
    typeof error.message === "string"
  );
};

const isDistanceValidationError = (error: unknown): error is DistanceValidationError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "kind" in error &&
    error.kind === "distance" &&
    "actualDistance" in error &&
    typeof error.actualDistance === "number"
  );
};

const normalizeValidationError = (error: unknown): ValidationError => {
  if (isGeolocationError(error)) {
    const titleByCode: Record<number, string> = {
      [GEOLOCATION_ERROR_CODE.UNSUPPORTED]: "Konum Desteklenmiyor",
      [GEOLOCATION_ERROR_CODE.PERMISSION_DENIED]: "Konum Erişimi Kapalı",
      [GEOLOCATION_ERROR_CODE.POSITION_UNAVAILABLE]: "Konum Servisi Kapalı Olabilir",
      [GEOLOCATION_ERROR_CODE.TIMEOUT]: "Konum Alınamadı",
    };
    const actionLabelByCode: Record<number, string> = {
      [GEOLOCATION_ERROR_CODE.PERMISSION_DENIED]: "Konum İzni Ver",
      [GEOLOCATION_ERROR_CODE.POSITION_UNAVAILABLE]: "Konumu Tekrar Kontrol Et",
      [GEOLOCATION_ERROR_CODE.TIMEOUT]: "Tekrar Dene",
    };
    const guidanceByCode: Record<number, string> = {
      [GEOLOCATION_ERROR_CODE.PERMISSION_DENIED]:
        "İzin penceresi açılmazsa adres çubuğundaki site ayarlarına dokunun ve Konum iznini ‘İzin ver’ olarak değiştirin.",
      [GEOLOCATION_ERROR_CODE.POSITION_UNAVAILABLE]:
        "Telefonunuzun hızlı ayarlarındaki Konum seçeneğini açtıktan sonra yeniden kontrol edin.",
    };

    return {
      title: titleByCode[error.code] ?? "Konum Doğrulanamadı",
      message: error.message,
      type: "location",
      actionLabel: actionLabelByCode[error.code] ?? "Konumu Tekrar Kontrol Et",
      guidance: guidanceByCode[error.code],
    };
  }

  if (isDistanceValidationError(error)) {
    return {
      title: "Restorana Çok Uzaksınız",
      message: `Restorana çok uzaksınız. Mevcut mesafe: ${error.actualDistance.toFixed(1)} metre (Maksimum: ${MAX_ALLOWED_DISTANCE_METERS.toFixed(1)} metre)`,
      type: "location",
      actionLabel: "Konumu Yeniden Kontrol Et",
    };
  }

  const scanError = error as Partial<TableScanError>;
  const message = scanError?.error || "Masa konumu doğrulanamadı. Lütfen tekrar deneyin.";

  if (scanError?.banReason) {
    return {
      title: "Restoran Hizmet Dışı",
      message,
      type: "scan",
      actionLabel: "Tekrar Dene",
    };
  }

  if (scanError?.status === 403 && scanError.maxAllowedDistance !== undefined) {
    const actualDistance = scanError.actualDistance;
    const distanceMessage =
      typeof actualDistance === "number"
        ? `Restorana çok uzaksınız. Mevcut mesafe: ${actualDistance.toFixed(1)} metre (Maksimum: ${scanError.maxAllowedDistance.toFixed(1)} metre)`
        : message;

    return {
      title: "Restorana Çok Uzaksınız",
      message: distanceMessage,
      type: "location",
      actionLabel: "Konumu Yeniden Kontrol Et",
    };
  }

  if (message.includes("null") || message.includes("doubleValue")) {
    return {
      title: "Masa Doğrulama Hatası",
      message: "Restoran konumu yapılandırılmamış. Lütfen restoranla iletişime geçin.",
      type: "scan",
      actionLabel: "Tekrar Dene",
    };
  }

  return {
    title: "Masa Doğrulama Hatası",
    message,
    type: "scan",
    actionLabel: "Tekrar Dene",
  };
};

const transformToApiResponse = (data: TableScanResponse): ApiResponse => {
  return {
    table: data.table,
    restaurantName: data.restaurantName,
    restaurantLogo: data.restaurantLogo?.trim() || null,
    restaurantLocation: data.restaurantLocation,
    restaurantLatitude: data.restaurantLatitude,
    restaurantLongitude: data.restaurantLongitude,
    menu: data.menu.map((category) => ({
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl || null,
      menuItems: category.menuItems,
      restaurantId: category.restaurantId,
    })),
    menuTheme: data.menuTheme || "DEFAULT",
  };
};

export default function TableMenuShell({ children }: { children: ReactNode }) {
  const params = useParams();
  const qrToken = params.qrToken as string;

  const [menuData, setMenuData] = useState<TableScanResponse | null>(null);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [isIntroVisible, setIsIntroVisible] = useState(false);

  const finishIntro = useCallback(() => {
    setIsIntroVisible(false);
  }, []);

  useEffect(() => {
    if (!qrToken) return;

    let isDisposed = false;
    let isValidationRunning = false;
    let restaurantCoordinates: LocationCoordinates | null = null;
    let consecutiveLocationFailureStartedAt: number | null = null;
    let latestLocationError: ValidationError | null = null;
    let nextValidationTimer: ReturnType<typeof setTimeout> | null = null;
    let gracePeriodTimer: ReturnType<typeof setTimeout> | null = null;
    let geolocationPermissionStatus: PermissionStatus | null = null;

    const clearTimer = (timer: ReturnType<typeof setTimeout> | null) => {
      if (timer !== null) clearTimeout(timer);
    };

    const scheduleGracePeriodError = () => {
      if (consecutiveLocationFailureStartedAt === null || gracePeriodTimer !== null) return;

      const elapsed = Date.now() - consecutiveLocationFailureStartedAt;
      const remaining = Math.max(LOCATION_VALIDATION_GRACE_PERIOD_MS - elapsed, 0);

      gracePeriodTimer = setTimeout(() => {
        gracePeriodTimer = null;
        if (
          !isDisposed &&
          consecutiveLocationFailureStartedAt !== null &&
          latestLocationError
        ) {
          setValidationError(latestLocationError);
        }
      }, remaining);
    };

    const scheduleNextValidation = (delay: number) => {
      clearTimer(nextValidationTimer);
      nextValidationTimer = setTimeout(() => {
        void validateLocation();
      }, delay);
    };

    const validateLocation = async () => {
      if (isDisposed || isValidationRunning) return;

      isValidationRunning = true;
      clearTimer(nextValidationTimer);
      nextValidationTimer = null;

      let shouldScheduleNextValidation = true;
      let nextValidationDelay = LOCATION_VALIDATION_INTERVAL_MS;

      try {
        const userLocation = await getUserLocation();
        if (isDisposed) return;

        if (restaurantCoordinates === null) {
          // The scan endpoint is needed only once to validate the QR token and
          // obtain menu/table data plus the restaurant coordinates.
          const tableData = await scanTable(qrToken, userLocation);
          if (isDisposed) return;

          if (
            !Number.isFinite(tableData.restaurantLatitude) ||
            !Number.isFinite(tableData.restaurantLongitude)
          ) {
            throw {
              status: 500,
              error: "Restoran konumu yapılandırılmamış. Lütfen restoranla iletişime geçin.",
            } satisfies TableScanError;
          }

          restaurantCoordinates = {
            latitude: tableData.restaurantLatitude,
            longitude: tableData.restaurantLongitude,
          };
          setIsIntroVisible(Boolean(tableData.restaurantLogo?.trim()));
          setMenuData(tableData);
        } else {
          const distance = calculateDistance(userLocation, restaurantCoordinates);

          if (distance > MAX_ALLOWED_DISTANCE_METERS) {
            throw {
              kind: "distance",
              actualDistance: distance,
            } satisfies DistanceValidationError;
          }
        }

        consecutiveLocationFailureStartedAt = null;
        latestLocationError = null;
        clearTimer(gracePeriodTimer);
        gracePeriodTimer = null;
        setValidationError(null);
      } catch (error) {
        if (isDisposed) return;

        const normalizedError = normalizeValidationError(error);

        if (isGeolocationError(error)) {
          latestLocationError = normalizedError;

          const shouldShowImmediately =
            restaurantCoordinates === null ||
            error.code === GEOLOCATION_ERROR_CODE.PERMISSION_DENIED ||
            error.code === GEOLOCATION_ERROR_CODE.UNSUPPORTED;

          if (shouldShowImmediately) {
            // There is no usable content on the initial request, while denied
            // permission is conclusive even after the menu has loaded.
            setValidationError(normalizedError);
            shouldScheduleNextValidation = false;
          } else {
            // A temporary GPS failure should not interrupt an open menu. Keep
            // retrying in the background and surface it after the grace period.
            consecutiveLocationFailureStartedAt ??= Date.now();
            scheduleGracePeriodError();
            nextValidationDelay = LOCATION_VALIDATION_RETRY_MS;
          }
        } else if (isDistanceValidationError(error)) {
          // A measured out-of-range position is a conclusive result, not an
          // unavailable location, so show it immediately and keep checking locally.
          setValidationError(normalizedError);
          nextValidationDelay = LOCATION_VALIDATION_RETRY_MS;
        } else {
          // 400/403, banned restaurants and other initial scan failures are
          // definitive backend responses. Do not leave the user on a spinner.
          setValidationError(normalizedError);
          shouldScheduleNextValidation = false;
        }
      } finally {
        isValidationRunning = false;
        if (!isDisposed && shouldScheduleNextValidation) {
          scheduleNextValidation(nextValidationDelay);
        }
      }
    };

    const validateWhenPageBecomesActive = () => {
      if (document.visibilityState === "visible") {
        clearTimer(nextValidationTimer);
        nextValidationTimer = null;
        void validateLocation();
      }
    };

    setMenuData(null);
    setValidationError(null);
    setIsIntroVisible(false);
    void validateLocation();

    document.addEventListener("visibilitychange", validateWhenPageBecomesActive);
    window.addEventListener("online", validateWhenPageBecomesActive);

    const validateWhenPermissionIsGranted = () => {
      if (geolocationPermissionStatus?.state === "granted") {
        setValidationError(null);
        scheduleNextValidation(0);
      }
    };

    if ("permissions" in navigator) {
      void navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (isDisposed) return;
          geolocationPermissionStatus = permissionStatus;
          permissionStatus.addEventListener("change", validateWhenPermissionIsGranted);
        })
        .catch(() => {
          // Permission state querying is a progressive enhancement. Geolocation
          // continues to work through getCurrentPosition when it is unsupported.
        });
    }

    return () => {
      isDisposed = true;
      clearTimer(nextValidationTimer);
      clearTimer(gracePeriodTimer);
      geolocationPermissionStatus?.removeEventListener(
        "change",
        validateWhenPermissionIsGranted,
      );
      document.removeEventListener("visibilitychange", validateWhenPageBecomesActive);
      window.removeEventListener("online", validateWhenPageBecomesActive);
    };
  }, [qrToken, validationAttempt]);

  const retryValidation = () => {
    setValidationError(null);
    setMenuData(null);
    setValidationAttempt((currentAttempt) => currentAttempt + 1);
  };

  if (!qrToken) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">QR Kod Gerekli</h2>
          <p className="text-gray-600">Lütfen masa üzerindeki QR kodu okutun</p>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-md items-center justify-center bg-white px-5 py-8 sm:rounded-3xl sm:shadow-2xl">
        <div className="w-full text-center" role="alert" aria-live="assertive">
          <div className="mb-4 text-6xl" aria-hidden="true">
            {validationError.type === "location" ? "📍" : "⚠️"}
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{validationError.title}</h2>
          <p className="mx-auto mb-6 max-w-sm text-base leading-6 text-gray-600">
            {validationError.message}
          </p>
          {validationError.guidance && (
            <div className="mx-auto mb-6 max-w-sm rounded-2xl bg-orange-50 px-4 py-3 text-left text-sm leading-5 text-orange-950">
              <p className="font-bold">Hızlı çözüm</p>
              <p className="mt-1">{validationError.guidance}</p>
            </div>
          )}
          <button
            type="button"
            onClick={retryValidation}
            className="btn h-12 min-h-12 w-full max-w-sm border-none bg-[#FF9F5A] text-base font-bold text-white hover:bg-[#e88d48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9F5A]"
          >
            {validationError.actionLabel}
          </button>
        </div>
      </main>
    );
  }

  if (!menuData) {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-md items-center justify-center bg-white px-5 py-8 sm:rounded-3xl sm:shadow-2xl">
        <div className="text-center" role="status" aria-live="polite">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Konumunuz doğrulanıyor...</p>
          <p className="mt-2 text-sm leading-5 text-gray-500">Bu işlem birkaç saniye sürebilir.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="relative">
      <div
        aria-hidden={isIntroVisible}
        inert={isIntroVisible}
        className={isIntroVisible ? "pointer-events-none" : undefined}
      >
        <MenuView apiData={transformToApiResponse(menuData)} />
        {children}
      </div>

      <AnimatePresence>
        {isIntroVisible && menuData.restaurantLogo?.trim() && (
          <BrandedMenuIntro
            key={`${qrToken}-intro`}
            logoUrl={menuData.restaurantLogo.trim()}
            restaurantName={menuData.restaurantName}
            theme={menuData.menuTheme || "DEFAULT"}
            onFinish={finishIntro}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
