import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  try {
    // 1. ID'yi URL'den al (örn: ?id=5)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !id) {
      return NextResponse.json({ message: 'Geçersiz istek' }, { status: 400 });
    }

    // 2. Token Formatı
    let authHeader = token.value;
    if (!authHeader.startsWith('Bearer ')) {
      authHeader = `Bearer ${authHeader}`;
    }

    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';

    // 3. Backend'e İlet (DOKÜMANTASYONA UYGUN: DELETE /api/manager/staff/{id})
    const response = await fetch(`${backendUrl}/api/manager/staff/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend Delete Error:', errorData);
      return NextResponse.json(
        { message: errorData.message || 'Silme işlemi başarısız' }, 
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Personel silindi' });

  } catch (error) {
    console.error('Staff Delete Route Error:', error);
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
  }
}