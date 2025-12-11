// src/app/api/public/table/scan/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.easyorder.com.tr/';

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

        console.log('🔄 Forwarding table scan request to backend:', {
            qrToken: body.qrToken,
            userLatitude: body.userLatitude,
            userLongitude: body.userLongitude
        });

        // Forward request to backend
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/public/table/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify(body),
        });

        const responseData = await backendResponse.json();

        if (!backendResponse.ok) {
            console.error('❌ Backend returned error:', responseData);
        } else {
            console.log('✅ Table scan successful:', {
                restaurant: responseData.restaurantName,
                table: responseData.table?.name
            });
        }

        return NextResponse.json(
            responseData,
            { status: backendResponse.status }
        );

    } catch (error) {
        console.error('❌ Table scan proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}