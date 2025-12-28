import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

/**
 * GET /api/Superadmin/restaurants/locations
 * Endpoint 11.3 - Harita Lokasyonları
 */
export async function GET(request: NextRequest) {
    try {
        const cookies = request.cookies;
        const cookieHeader = cookies.toString();

        const backendResponse = await fetch(
            `${BACKEND_API_URL}/api/superadmin/restaurants/locations`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Cookie': cookieHeader,
                },
            }
        );

        const responseData = await backendResponse.json().catch(() => []);
        return NextResponse.json(responseData, { status: backendResponse.status });

    } catch (error) {
        console.error('Error fetching locations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
