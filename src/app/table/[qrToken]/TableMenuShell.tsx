"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import {
  calculateDistance,
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

type ValidationError = {
  title: string;
  message: string;
  type: "location" | "scan";
};

type DistanceValidationError = {
  kind: "distance";
  actualDistance: number;
};

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
    return {
      title: error.code === 1 ? "Konum İzni Gerekli" : "Konum Doğrulanamadı",
      message: error.message,
      type: "location",
    };
  }

  if (isDistanceValidationError(error)) {
    return {
      title: "Restorana Çok Uzaksınız",
      message: `Restorana çok uzaksınız. Mevcut mesafe: ${error.actualDistance.toFixed(1)} metre (Maksimum: ${MAX_ALLOWED_DISTANCE_METERS.toFixed(1)} metre)`,
      type: "location",
    };
  }

  const scanError = error as Partial<TableScanError>;
  const message = scanError?.error || "Masa konumu doğrulanamadı. Lütfen tekrar deneyin.";

  if (scanError?.banReason) {
    return {
      title: "Restoran Hizmet Dışı",
      message,
      type: "scan",
    };
  }

  if (scanError?.status === 403 && scanError.maxAllowedDistance !== undefined) {
    return {
      title: "Restorana Çok Uzaksınız",
      message,
      type: "location",
    };
  }

  if (message.includes("null") || message.includes("doubleValue")) {
    return {
      title: "Masa Doğrulama Hatası",
      message: "Restoran konumu yapılandırılmamış. Lütfen restoranla iletişime geçin.",
      type: "scan",
    };
  }

  return {
    title: "Masa Doğrulama Hatası",
    message,
    type: "scan",
  };
};

const transformToApiResponse = (data: TableScanResponse): ApiResponse => {
  return {
    table: data.table,
    restaurantName:
      data.restaurantName.length > 5
        ? data.restaurantName.substring(0, 7) + "..."
        : data.restaurantName,
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

  useEffect(() => {
    if (!qrToken) return;

    let isDisposed = false;
    let isValidationRunning = false;
    let restaurantCoordinates: LocationCoordinates | null = null;
    let consecutiveLocationFailureStartedAt: number | null = null;
    let latestLocationError: ValidationError | null = null;
    let nextValidationTimer: ReturnType<typeof setTimeout> | null = null;
    let gracePeriodTimer: ReturnType<typeof setTimeout> | null = null;

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

    const getCurrentLocation = async (): Promise<LocationCoordinates> => {
      try {
        return await getUserLocation();
      } catch (error) {
        const isFallbackEnabled =
          process.env.NEXT_PUBLIC_ENABLE_GEOLOCATION_FALLBACK === "true";

        if (!isGeolocationError(error) || !isFallbackEnabled) throw error;

        console.warn("Geolocation failed, using fallback location:", error.message);
        return { latitude: 0, longitude: 0 };
      }
    };

    const validateLocation = async () => {
      if (isDisposed || isValidationRunning) return;

      isValidationRunning = true;
      clearTimer(nextValidationTimer);
      nextValidationTimer = null;

      let shouldScheduleNextValidation = true;
      let nextValidationDelay = LOCATION_VALIDATION_INTERVAL_MS;

      try {
        const userLocation = await getCurrentLocation();
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
          // GPS/permission failures can be transient. Keep the current UI and
          // surface the error only if every retry fails throughout the grace period.
          latestLocationError = normalizedError;
          consecutiveLocationFailureStartedAt ??= Date.now();
          scheduleGracePeriodError();
          nextValidationDelay = LOCATION_VALIDATION_RETRY_MS;
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
    void validateLocation();

    document.addEventListener("visibilitychange", validateWhenPageBecomesActive);
    window.addEventListener("online", validateWhenPageBecomesActive);

    return () => {
      isDisposed = true;
      clearTimer(nextValidationTimer);
      clearTimer(gracePeriodTimer);
      document.removeEventListener("visibilitychange", validateWhenPageBecomesActive);
      window.removeEventListener("online", validateWhenPageBecomesActive);
    };
  }, [qrToken]);

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
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 text-6xl mb-4">
            {validationError.type === "location" ? "📍" : "⚠️"}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{validationError.title}</h2>
          <p className="text-gray-600 mb-4">{validationError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn bg-[#FF9F5A] hover:bg-[#e88d48] text-white border-none"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-600 text-lg">Menü yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MenuView apiData={transformToApiResponse(menuData)} />
      {children}
    </>
  );
}
