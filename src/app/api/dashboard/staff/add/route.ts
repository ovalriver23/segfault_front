import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Yetki Kontrolü
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    // 2. Token Formatı (Bearer)
    let authHeader = token.value;
    if (!authHeader.startsWith('Bearer ')) {
      authHeader = `Bearer ${authHeader}`;
    }

    // 3. Frontend'den gelen veriyi al
    const body = await request.json();
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';

    // 4. Backend'e İlet (DOKÜMANTASYONA UYGUN: POST /api/manager/staff)
    const response = await fetch(`${backendUrl}/api/manager/staff`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body), // RegisterRequest yapısı (username, password, firstName...)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend Add Error:', data);
      return NextResponse.json(
        { message: data.error || data.message || 'Personel eklenemedi' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Staff Add Route Error:', error);
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
  }
}