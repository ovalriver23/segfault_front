import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

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