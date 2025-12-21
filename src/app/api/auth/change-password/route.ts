import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Token kontrolü
    const cookieStore = await cookies();
    const token = cookieStore.get('JWT_TOKEN')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    // 2. Backend'e istek (Dokümantasyon 5.3 referansı)
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/account/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword
      }),
    });

    // 3. Backend yanıtını işle
    if (!backendResponse.ok) {
      // Backend text veya json dönebilir, ikisini de kontrol edelim
      const contentType = backendResponse.headers.get("content-type");
      let errorMessage = 'Şifre değiştirilemedi.';
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
         const errorJson = await backendResponse.json();
         errorMessage = errorJson.error || errorMessage;
      } else {
         errorMessage = await backendResponse.text();
      }

      return NextResponse.json({ message: errorMessage }, { status: backendResponse.status });
    }

    return NextResponse.json({ message: 'Şifre başarıyla güncellendi' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}