import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

/**
 * GET /api/public/table/order?qrToken={qrToken}
 * 
 * Müşterinin masada verdiği tüm siparişleri listeler.
 * Backend API Section 10.6: Siparişlerimi Listele
 * 
 * Query Parameters:
 * - qrToken: Masanın güvenlik için üretilmiş QR Token'ı
 * 
 * Success Response (200):
 * [
 *   {
 *     "id": 4,
 *     "status": "RECEIVED",
 *     "totalAmount": 150.0,
 *     "createdAt": "2025-12-21T12:16:31.591767769",
 *     "generalNote": null,
 *     "canCancel": true,
 *     "cancellationReason": null,
 *     "items": [
 *       {
 *         "menuItemName": "Adana Kebap",
 *         "quantity": 1,
 *         "price": 150.0,
 *         "note": null
 *       }
 *     ]
 *   }
 * ]
 * 
 * Order statuses:
 * - RECEIVED: Sipariş alındı
 * - PREPARING: Hazırlanıyor
 * - READY: Hazır
 * - SERVED: Servis edildi
 * - COMPLETED: Ödeme alındı / Bitti
 * - CANCELLED: İptal
 */

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  generalNote: string | null;
  canCancel: boolean;
  cancellationReason: string | null;
  items: {
    menuItemName: string;
    quantity: number;
    price: number;
    note: string | null;
  }[];
}

type OrderResponse = Order[];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qrToken = searchParams.get('qrToken');

    if (!qrToken) {
      return NextResponse.json(
        { error: 'QR Token gereklidir' },
        { status: 400 }
      );
    }

    // Forward request to backend
    const backendResponse = await fetch(
      `${BACKEND_API_URL}/api/public/order?qrToken=${encodeURIComponent(qrToken)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const responseData: OrderResponse = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        responseData,
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Siparişler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/public/order
 * 
 * Müşterinin QR kod ile sipariş vermesini sağlar.
 * Backend API Section 10.4: Sipariş Ver
 * 
 * Request Body:
 * {
 *   "qrToken": "a6c165be-01ad-4d4b-bb0f-ee3e9a24dccb",
 *   "items": [{
 *     "menuItemId": 3,
 *     "quantity": 2,
 *     "note": "Soğansız"
 *   }],
 *   "generalNote": "Acılı olsun lütfen"
 * }
 * 
 * Success Response (201):
 * {
 *   "message": "Sipariş başarıyla alındı",
 *   "orderId": 3
 * }
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

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Sipariş için en az bir ürün seçilmelidir' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of body.items) {
      if (!item.menuItemId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Geçersiz ürün bilgisi' },
          { status: 400 }
        );
      }
    }

    // Forward request to backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/public/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        responseData,
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Sipariş işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}