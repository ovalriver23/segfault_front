// src/app/api/public/table/scan/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.easyorder.com.tr';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.qrToken || body.userLatitude === undefined || body.userLongitude === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: qrToken, userLatitude, userLongitude' },
                { status: 400 }
            );
        }



        // Forward request to backend
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/public/table/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify(body),
        });

        const responseData = await backendResponse.json();

        // Handle specific error cases based on API documentation (section 10.2)
        if (!backendResponse.ok) {
            // 403: Too far from restaurant
            if (backendResponse.status === 403) {
                return NextResponse.json(
                    {
                        error: responseData.error || 'You are too far from the restaurant',
                        maxAllowedDistance: responseData.maxAllowedDistance,
                        actualDistance: responseData.actualDistance
                    },
                    { status: 403 }
                );
            }

            // 400: Invalid token format or token not found
            if (backendResponse.status === 400) {
                return NextResponse.json(
                    { error: responseData.error || 'Invalid QR token' },
                    { status: 400 }
                );
            }

            // Other errors
            return NextResponse.json(
                { error: responseData.error || 'An error occurred' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(
            responseData,
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}