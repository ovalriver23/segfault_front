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

        const backendResponse = await fetch(`${BACKEND_API_URL}/api/staff/orders/active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store'
        });

        if (!backendResponse.ok) {
            const contentType = backendResponse.headers.get("content-type");
            
            if (contentType && contentType.includes("application/json")) {
                const errorData = await backendResponse.json();
                return NextResponse.json(errorData, { status: backendResponse.status });
            } else {
                const errorText = await backendResponse.text();
                return NextResponse.json(
                    { message: errorText || 'Siparişler yüklenirken hata oluştu' }, 
                    { status: backendResponse.status }
                );
            }
        }

        const data = await backendResponse.json();
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Active Orders Route Error:', error);
        return NextResponse.json(
            { message: 'Sunucu hatası oluştu', error: 'INTERNAL_SERVER_ERROR' },
            { status: 500 }
        );
    }
}
