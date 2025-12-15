import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('JWT_TOKEN')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Oturum açmanız gerekiyor', error: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const backendResponse = await fetch(`${BACKEND_API_URL}/api/staff/tables`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store'
        });

        // Backend yanıtı başarısızsa
        if (!backendResponse.ok) {
            // Yanıtın JSON olup olmadığını kontrol et
            const contentType = backendResponse.headers.get("content-type");
            
            if (contentType && contentType.includes("application/json")) {
                // Backend'den gelen orjinal hata mesajını al (Örn: {"error": "..."})
                const errorData = await backendResponse.json();
                return NextResponse.json(errorData, { status: backendResponse.status });
            } else {
                // JSON değilse text olarak al
                const errorText = await backendResponse.text();
                return NextResponse.json(
                    { message: errorText || 'Masalar yüklenirken hata oluştu' }, 
                    { status: backendResponse.status }
                );
            }
        }

        const data = await backendResponse.json();
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Waiter Tables Route Error:', error);
        return NextResponse.json(
            { message: 'Sunucu hatası oluştu', error: 'INTERNAL_SERVER_ERROR' },
            { status: 500 }
        );
    }
}