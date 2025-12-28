import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

/**
 * GET /api/Superadmin/restaurants
 * 
 * Proxies to backend: GET /api/superadmin/restaurants
 * Endpoint 11.1 from documentation
 */
export async function GET(request: NextRequest) {
    try {
        // Get cookies from the incoming request
        const cookies = request.cookies;
        const cookieHeader = cookies.toString();

        // Get query params from request URL
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '0';
        const size = searchParams.get('size') || '10';
        const searchTerm = searchParams.get('searchTerm') || '';
        const isApproved = searchParams.get('isApproved');
        const isBanned = searchParams.get('isBanned');

        // Build query string
        let queryString = `page=${page}&size=${size}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (isApproved !== null && isApproved !== '') queryString += `&isApproved=${isApproved}`;
        if (isBanned !== null && isBanned !== '') queryString += `&isBanned=${isBanned}`;

        // Forward the request to the backend with cookies
        const backendResponse = await fetch(
            `${BACKEND_API_URL}/api/superadmin/restaurants?${queryString}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Cookie': cookieHeader,
                },
            }
        );

        // Get the response body
        let responseData;
        try {
            responseData = await backendResponse.json();
        } catch (error) {
            const textResponse = await backendResponse.text();
            return NextResponse.json(
                { error: 'Invalid response from backend', details: textResponse },
                { status: 502 }
            );
        }

        return NextResponse.json(responseData, { status: backendResponse.status });

    } catch (error) {
        console.error('Error fetching restaurants:', error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                { error: 'Unable to connect to backend service' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
