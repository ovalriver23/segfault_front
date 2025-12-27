import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Yetki Kontrolü
    const cookieStore = await cookies();
    const token = cookieStore.get('JWT_TOKEN');

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

    // 4. FormData oluştur (Backend artık multipart/form-data bekliyor)
    const formData = new FormData();
    formData.append('username', body.username || '');
    formData.append('password', body.password || '');
    formData.append('firstName', body.firstName || '');
    formData.append('lastName', body.lastName || '');
    formData.append('gender', body.gender || 'MALE');
    formData.append('email', body.email || '');
    formData.append('phoneNumber', body.phoneNumber || '');

    // 5. Backend'e İlet (POST /api/manager/staff - multipart/form-data)
    const response = await fetch(`${backendUrl}/api/manager/staff`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        // Content-Type otomatik olarak FormData ile ayarlanır (boundary dahil)
      },
      body: formData,
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