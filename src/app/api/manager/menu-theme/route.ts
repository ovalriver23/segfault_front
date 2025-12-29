import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Valid menu themes
const VALID_THEMES = ['DEFAULT', 'MODERN', 'ELEGANT'] as const;
type MenuTheme = typeof VALID_THEMES[number];

export async function GET() {
    try {
        // 1. Auth check
        const cookieStore = await cookies();
        const token = cookieStore.get('JWT_TOKEN');

        if (!token) {
            return NextResponse.json(
                { error: 'Oturum açmanız gerekiyor' },
                { status: 401 }
            );
        }

        // 2. Format auth header
        const authHeader = token.value.startsWith('Bearer ')
            ? token.value
            : `Bearer ${token.value}`;

        // 3. Fetch from backend
        const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
        const response = await fetch(`${backendUrl}/api/manager/menu-theme`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json;charset=UTF-8',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Backend Menu Theme Fetch Error:', data);
            return NextResponse.json(
                { error: data.error || data.message || 'Menü teması getirilemedi' },
                { status: response.status }
            );
        }

        // 4. Return theme
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Menu Theme GET Route Error:', error);
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        // 1. Auth check
        const cookieStore = await cookies();
        const token = cookieStore.get('JWT_TOKEN');

        if (!token) {
            return NextResponse.json(
                { error: 'Oturum açmanız gerekiyor' },
                { status: 401 }
            );
        }

        // 2. Format auth header
        const authHeader = token.value.startsWith('Bearer ')
            ? token.value
            : `Bearer ${token.value}`;

        // 3. Parse request body
        const body = await request.json();
        const { theme } = body;

        // 4. Validate theme field
        if (!theme) {
            return NextResponse.json(
                { error: 'Tema alanı zorunludur' },
                { status: 400 }
            );
        }

        // 5. Validate theme value
        if (!VALID_THEMES.includes(theme as MenuTheme)) {
            return NextResponse.json(
                { error: 'Geçersiz tema. Geçerli temalar: DEFAULT, MODERN, ELEGANT' },
                { status: 400 }
            );
        }

        // 6. Send to backend
        const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
        const response = await fetch(`${backendUrl}/api/manager/menu-theme`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({ theme }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Backend Menu Theme Update Error:', data);
            return NextResponse.json(
                { error: data.error || data.message || 'Menü teması güncellenemedi' },
                { status: response.status }
            );
        }

        // 7. Return success
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Menu Theme Route Error:', error);
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}
