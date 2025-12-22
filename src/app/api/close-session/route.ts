import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tableId } = body;

        if (!tableId) {
            return NextResponse.json(
                { error: 'Masa ID gereklidir' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const token = cookieStore.get('JWT_TOKEN')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Yetkisiz erişim' },
                { status: 401 }
            );
        }

        // Call backend API: POST /api/staff/tables/{tableId}/stop-session
        const backendUrl = `${BACKEND_API_URL}/api/staff/tables/${tableId}/stop-session`;

        console.log('Closing session for table:', tableId);
        console.log('Backend URL:', backendUrl);

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Backend error:', data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Close session error:', error);
        return NextResponse.json(
            { error: 'İşlem sırasında bir hata oluştu' },
            { status: 500 }
        );
    }
}
