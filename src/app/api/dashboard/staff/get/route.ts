import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Sayfanın statik olarak build edilmesini engeller, her istekte sunucudan veri çeker.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Next.js 15+ için await cookies() kullanımı
    const cookieStore = await cookies();
    const token = cookieStore.get('JWT_TOKEN');

    // Token kontrolü
    if (!token) {
      return NextResponse.json({ message: 'Oturum açmanız gerekiyor.' }, { status: 401 });
    }

    // 2. Token formatını "Bearer <token>" olarak ayarla
    let authHeader = token.value;
    if (!authHeader.startsWith('Bearer ')) {
      authHeader = `Bearer ${authHeader}`;
    }

    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    
    // 3. Backend İsteği (Dokümantasyona Göre Doğru Endpoint)
    // Dokümantasyon Kaynağı: [[resources-manager-get-staff]] -> GET /api/manager/staff
    const response = await fetch(`${backendUrl}/api/manager/staff`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Verilerin her zaman taze kalmasını sağlar
    });

    // 4. Hata Yönetimi
    if (!response.ok) {
       console.error(`Backend Hatası (${response.status}):`, response.statusText);
       
       if (response.status === 401 || response.status === 403) {
         return NextResponse.json({ message: 'Yetkisiz Erişim. Lütfen tekrar giriş yapın.' }, { status: 401 });
       }
       
       return NextResponse.json({ message: 'Personel listesi alınamadı.' }, { status: response.status });
    }

    // 5. Başarılı Veri Dönüşü
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Staff Get Route Error:', error);
    return NextResponse.json({ message: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}