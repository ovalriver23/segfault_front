// src/app/table/[qrToken]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getUserLocation, LocationCoordinates, GeolocationError } from "../../lib/utils/geolocation";
import { scanTable, TableScanResponse, TableScanError } from "../../lib/services/tableService";
import MenuView, { ApiResponse } from "../../../components/MenuView";
// --- ANA SAYFA BİLEŞENİ ---
export default function TableMenuPage() {
  const params = useParams();
  const qrToken = params.qrToken as string;

  // Geolocation & Table Scan State
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [menuData, setMenuData] = useState<TableScanResponse | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  // Capture geolocation when component mounts
  useEffect(() => {
    const captureLocation = async () => {
      if (!qrToken) {
        return;
      }

      setIsLoadingLocation(true);
      setNeedsPermission(false);
      
      try {
        const location = await getUserLocation();
        setUserLocation(location);

        const tableData = await scanTable(qrToken, location);
        setMenuData(tableData);
        
      } catch (error) {
        const err = error as GeolocationError | TableScanError;
        
        if ('code' in err) {
          const isFallbackEnabled =
            typeof process !== "undefined" &&
            process.env.NEXT_PUBLIC_ENABLE_GEOLOCATION_FALLBACK === "true";

          if (isFallbackEnabled) {
            // Geolocation error - try with fallback location (development/testing only)
            console.warn('Geolocation failed, attempting with fallback location:', err.message);
            try {
              // Use fallback coordinates (0,0) only when explicitly enabled via env flag
              const fallbackLocation: LocationCoordinates = { latitude: 0, longitude: 0 };
              const tableData = await scanTable(qrToken, fallbackLocation);
              setMenuData(tableData);
              setUserLocation(fallbackLocation);
            } catch (fallbackError) {
              const fallbackErr = fallbackError as TableScanError;
              if (err.code === 1) {
                // Permission denied - show permission request screen
                setNeedsPermission(true);
              } else {
                setLocationError(err.message);
              }
              // Also show scan error if fallback failed
              if (fallbackErr.error) {
                setScanError(fallbackErr.error);
              }
            }
          } else {
            // Fallback disabled (e.g., production): surface geolocation error instead
            if (err.code === 1) {
              // Permission denied - show permission request screen
              setNeedsPermission(true);
            } else {
              setLocationError(err.message);
            }
          }
        } else {
          // Table scan error
          
          // TEMPORARY: Skip distance validation if restaurant location is not set
          // Remove this block once backend sets restaurant coordinates
          if (err.error && (err.error.includes('null') || err.error.includes('doubleValue'))) {
            setScanError('Restaurant location not configured. Contact the restaurant to set up geolocation verification.');
            return;
          }
          
          setScanError(err.error);
        }
      } finally {
        setIsLoadingLocation(false);
      }
    };

    captureLocation();
  }, [qrToken]);

  // Transform backend TableScanResponse to MenuView ApiResponse format
  const transformToApiResponse = (data: TableScanResponse): ApiResponse => {
    return {
      table: data.table,
      restaurantName: data.restaurantName,
      restaurantLocation: data.restaurantLocation,
      restaurantLatitude: data.restaurantLatitude,
      restaurantLongitude: data.restaurantLongitude,
      menu: data.menu.map(category => ({
        id: category.id,
        name: category.name,
        imageUrl: category.imageUrl || null,
        menuItems: category.menuItems,
        restaurantId: category.restaurantId
      }))
    };
  };

  // Show loading state while capturing location
  if (isLoadingLocation) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-600 text-lg">Konum alınıyor...</p>
          <p className="text-gray-400 text-sm mt-2">Lütfen konum erişimine izin verin</p>
        </div>
      </div>
    );
  }

  // Show permission request screen
  if (needsPermission) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-[#FF9F5A] text-6xl mb-4">📍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Konum İzni Gerekli</h2>
          <p className="text-gray-600 mb-6">
            Menüyü görüntülemek için konum izninize ihtiyacımız var. 
            Bu, masanızın doğruluğunu kontrol etmek içindir.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn bg-[#FF9F5A] hover:bg-[#e88d48] text-white border-none"
          >
            İzin Ver
          </button>
        </div>
      </div>
    );
  }

  // Show error if geolocation failed
  if (locationError) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 text-6xl mb-4">📍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Konum Erişimi Gerekli</h2>
          <p className="text-gray-600 mb-4">{locationError}</p>
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

  // Show error if table scan failed
  if (scanError) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Masa Doğrulama Hatası</h2>
          <p className="text-gray-600 mb-4">{scanError}</p>
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

  // Show prompt if no QR token
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

  // Show prompt if menu not loaded yet
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

  // --- RENDER BÖLÜMÜ ---
  // Use MenuView component with transformed data
  return <MenuView apiData={transformToApiResponse(menuData)} />;
}
