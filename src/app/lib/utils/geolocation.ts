// src/app/lib/utils/geolocation.ts
export interface LocationCoordinates {
    latitude: number;
    longitude: number;
}

export interface GeolocationError {
    code: number;
    message: string;
}

export const GEOLOCATION_ERROR_CODE = {
    UNSUPPORTED: 0,
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
} as const;

/**
 * Get user's current geolocation
 * Returns a promise that resolves with coordinates or rejects with an error
 */
export const getUserLocation = (): Promise<LocationCoordinates> => {
    return new Promise((resolve, reject) => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            reject({
                code: GEOLOCATION_ERROR_CODE.UNSUPPORTED,
                message: 'Tarayıcınız konum özelliğini desteklemiyor. Lütfen güncel bir tarayıcıyla tekrar deneyin.'
            } as GeolocationError);
            return;
        }

        // Request current position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coordinates: LocationCoordinates = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                resolve(coordinates);
            },
            (error) => {
                // Handle different error types
                let errorMessage = 'Konum alınamadı';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Telefonunuzun konum servislerini ve bu tarayıcı için konum iznini açın, ardından tekrar deneyin.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Konumunuz alınamıyor. Telefonunuzun konum servislerinin açık olduğundan emin olun ve tekrar deneyin.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Konumunuz belirlenirken zaman aşımı oluştu. Açık bir alanda tekrar deneyin.';
                        break;
                }
                
                
                reject({
                    code: error.code,
                    message: errorMessage
                } as GeolocationError);
            },
            {
                enableHighAccuracy: true, // Request high accuracy
                timeout: 15000, // 15 second timeout (longer for mobile)
                maximumAge: 0 // Don't use cached position
            }
        );
    });
};

/**
 * Watch user's location for continuous updates
 * Returns a watch ID that can be used to clear the watch later
 */
export const watchUserLocation = (
    onSuccess: (location: LocationCoordinates) => void,
    onError?: (error: GeolocationError) => void
): number | null => {
    if (!navigator.geolocation) {
        return null;
    }

    return navigator.geolocation.watchPosition(
        (position) => {
            const coordinates: LocationCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            onSuccess(coordinates);
        },
        (error) => {
            const geolocationError: GeolocationError = {
                code: error.code,
                message: error.message
            };
            
            if (onError) {
                onError(geolocationError);
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
};

/**
 * Clear location watch
 */
export const clearLocationWatch = (watchId: number): void => {
    if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
    }
};

/**
 * Calculate distance between two coordinates in meters
 * Uses Haversine formula
 */
export const calculateDistance = (
    coord1: LocationCoordinates,
    coord2: LocationCoordinates
): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};
