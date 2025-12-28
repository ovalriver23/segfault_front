import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

/**
 * POST /api/public/table/order/[orderId]/cancel
 * 
 * Müşterinin verdiği siparişi iptal etmesini sağlar.
 * Backend API Section 10.7: Sipariş İptal Et (Müşteri)
 * 
 * Path Parameters:
 * - orderId: İptal edilecek sipariş ID
 * 
 * Request Body:
 * {
 *   "qrToken": "a6c165be-01ad-4d4b-bb0f-ee3e9a24dccb",
 *   "reason": "Yanlış sipariş verdim" (optional)
 * }
 * 
 * Success Response (200):
 * {
 *   "message": "Siparişiniz iptal edildi."
 * }
 * 
 * Error Responses:
 * - 400: İptal süresi dolmuş / Sipariş zaten iptal edilmiş / Token geçersiz
 * - 404: Sipariş bulunamadı
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
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
            `${BACKEND_API_URL}/api/public/order/${orderId}/cancel`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    qrToken: body.qrToken,
                    reason: body.reason || undefined
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
            { error: 'Sipariş iptal edilirken bir hata oluştu' },
            { status: 500 }
        );
    }
}
