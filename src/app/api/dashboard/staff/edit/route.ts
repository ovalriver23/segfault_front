import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    // 1. ID'yi URL'den al
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const cookieStore = await cookies();
    const token = cookieStore.get('JWT_TOKEN');

    if (!token || !id) {
      return NextResponse.json({ message: 'Geçersiz istek' }, { status: 400 });
    }

    // 2. Body verisini al
    const body = await request.json();

    // 3. Token Formatı
    let authHeader = token.value;
    if (!authHeader.startsWith('Bearer ')) {
      authHeader = `Bearer ${authHeader}`;
    }

    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';

    // 4. Backend'e İlet (DOKÜMANTASYON 7.7: PUT /api/manager/staff/{staffId})
    const response = await fetch(`${backendUrl}/api/manager/staff/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        email: body.email,
        phoneNumber: body.phoneNumber
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Güncelleme başarısız' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Staff Edit Route Error:', error);
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
  }
}