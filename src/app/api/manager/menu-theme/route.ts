import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.easyorder.com.tr';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Get JWT token from cookies
        const jwtToken = request.cookies.get('JWT_TOKEN')?.value;

        if (!jwtToken) {
            console.error('❌ Tema güncelleme: JWT_TOKEN bulunamadı');
            return NextResponse.json(
                { error: 'Oturum bulunamadı' },
                { status: 401 }
            );
        }

        console.log('📤 Tema güncelleme isteği backend\'e gönderiliyor:', body.theme);

        const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/menu-theme`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `JWT_TOKEN=${jwtToken}`
            },
            body: JSON.stringify({ theme: body.theme }),
            credentials: 'include'
        });

        const responseText = await backendResponse.text();
        console.log('📥 Backend PUT yanıtı:', backendResponse.status, responseText);

        let data;
        try {
            data = responseText ? JSON.parse(responseText) : { theme: body.theme };
        } catch {
            data = { message: responseText || 'Tema güncellendi' };
        }

        if (!backendResponse.ok) {
            console.error('❌ Tema güncelleme hatası:', data);
            return NextResponse.json(
                { error: data.message || data.error || 'Tema güncellenemedi' },
                { status: backendResponse.status }
            );
        }

        console.log('✅ Tema başarıyla güncellendi:', body.theme);
        return NextResponse.json({ theme: body.theme, ...data }, { status: 200 });

    } catch (error) {
        console.error('Error updating theme:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get JWT token from cookies
        const jwtToken = request.cookies.get('JWT_TOKEN')?.value;

        if (!jwtToken) {
            console.log('⚠️ JWT_TOKEN bulunamadı, DEFAULT tema kullanılıyor');
            return NextResponse.json(
                { theme: 'DEFAULT' },
                {
                    headers: {
                        'Cache-Control': 'no-store, max-age=0, must-revalidate'
                    }
                }
            );
        }

        console.log('📤 Tema bilgisi için backend /api/account/me çağrılıyor...');

        // Backend /api/account/me - menuTheme alanını burada aramalıyız
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/account/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `JWT_TOKEN=${jwtToken}`
            },
            credentials: 'include'
        });

        const responseText = await backendResponse.text();
        console.log('📥 Backend account/me yanıtı:', backendResponse.status);

        if (backendResponse.ok && responseText) {
            try {
                const data = JSON.parse(responseText);
                console.log('📥 Account data keys:', Object.keys(data));

                // menuTheme doğrudan veya restaurant içinde olabilir
                const theme = data.menuTheme || data.restaurant?.menuTheme || 'DEFAULT';
                console.log('✅ Tema alındı:', theme);

                return NextResponse.json(
                    { theme },
                    {
                        headers: {
                            'Cache-Control': 'no-store, max-age=0, must-revalidate'
                        }
                    }
                );
            } catch (e) {
                console.warn('⚠️ Backend yanıtı JSON değil');
            }
        } else {
            console.log('⚠️ Backend account/me başarısız:', backendResponse.status);
        }

        // Fallback to DEFAULT
        console.log('⚠️ Tema alınamadı, DEFAULT kullanılıyor');
        return NextResponse.json(
            { theme: 'DEFAULT' },
            {
                headers: {
                    'Cache-Control': 'no-store, max-age=0, must-revalidate'
                }
            }
        );

    } catch (error) {
        console.error('❌ Tema alınırken hata:', error);
        return NextResponse.json(
            { theme: 'DEFAULT' },
            { status: 200 }
        );
    }
}
