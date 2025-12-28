import { LocationCoordinates } from '../utils/geolocation';

export interface TableScanRequest {
    qrToken: string;
    userLatitude: number;
    userLongitude: number;
}

export interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    style: string | null;
    available: boolean;
    categoryId: number;
    categoryName: string;
}

export interface MenuCategory {
    id: number;
    name: string;
    imageUrl: string | null;
    menuItems: MenuItem[];
    restaurantId: string;
}

export interface TableInfo {
    id: string;
    name: string;
    qrToken: string;
    capacity: number;
    status: 'EMPTY' | 'OCCUPIED' | 'RESERVED';
    restaurantId: string;
}

export interface TableScanResponse {
    table: TableInfo;
    restaurantName: string;
    restaurantLocation: string;
    restaurantLatitude: number;
    restaurantLongitude: number;
    menu: MenuCategory[];
    menuTheme: 'DEFAULT' | 'MODERN' | 'ELEGANT';
}

export interface TableScanError {
    maxAllowedDistance?: number;
    actualDistance?: number;
    error: string;
}

export const scanTable = async (
    qrToken: string,
    location: LocationCoordinates
): Promise<TableScanResponse> => {
    const payload: TableScanRequest = {
        qrToken,
        userLatitude: location.latitude,
        userLongitude: location.longitude,
    };

    // Use relative path to leverage Next.js proxy (avoids CORS)
    const response = await fetch(`/api/public/table/scan`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            throw errorData as TableScanError;
        } else {
            const textBody = await response.text();
            throw { error: `Server Error (${response.status}): ${textBody}` } as TableScanError;
        }
    }

    return response.json();
};
