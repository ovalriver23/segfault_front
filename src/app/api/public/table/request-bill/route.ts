import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

/**
 * POST /api/public/table/request-bill
 * 
 * Müşterinin hesap istemesini sağlar.
 * Backend API Section 10.4: Hesap İste
 * 
 * Request Body:
 * {
 *   "qrToken": "a6c165be-01ad-4d4b-bb0f-ee3e9a24dccb"
 * }
 * 
 * Success Response (200):
 * {
 *   "message": "Hesap isteği gönderildi"
 * }
 * 
 * Error Responses:
 * - 400: Geçersiz QR token / Aktif oturum yok
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.qrToken) {
            return NextResponse.json(
                { error: 'QR Token gereklidir' },
                { status: 400 }
            );
        }

        // Forward request to backend
        const backendResponse = await fetch(
            `${BACKEND_API_URL}/api/public/table/scan/request-bill`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    qrToken: body.qrToken
                }),
            }
        );

        const responseData = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                responseData,
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: 'Hesap isteği gönderilirken bir hata oluştu' },
            { status: 500 }
        );
    }
}
