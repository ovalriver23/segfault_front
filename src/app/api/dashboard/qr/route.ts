import { UUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';


export async function GET(request: NextRequest) {
    try {
        // Get JWT token from request cookies
        const token = request.cookies.get('JWT_TOKEN')?.value;

        // Get tableId and size from query parameters
        const searchParams = request.nextUrl.searchParams;
        const tableId = searchParams.get('tableId');
        const sizeParam = searchParams.get('size') || '300';
        const size = parseInt(sizeParam, 10);
        if (isNaN(size) || size < 100 || size > 1000) {
            return NextResponse.json(
                { error: 'Size must be a number between 100 and 1000' },
                { status: 400 }
            );
        }

        if (!tableId) {
            return NextResponse.json(
                { error: 'Table ID is required' },
                { status: 400 }
            );
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json;charset=UTF-8',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const backendResponse = await fetch(
            `${BACKEND_API_URL}/api/manager/tables/${tableId}/qr-code?size=${size}`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json().catch(() => ({ error: 'Failed to fetch QR code' }));
            return NextResponse.json(
                errorData,
                { status: backendResponse.status }
            );
        }

        // Get the image data as a buffer
        const imageBuffer = await backendResponse.arrayBuffer();
        
        // Return the image without forcing download
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
            },
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
