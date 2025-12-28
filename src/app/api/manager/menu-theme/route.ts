import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.easyorder.com.tr';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const cookies = request.cookies;
        const cookieHeader = cookies.toString();

        const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/menu-theme`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader
            },
            body: JSON.stringify(body)
        });

        const data = await backendResponse.json();

        // Also update local store for dev fallback if needed, or remove if fully migrating
        // For safety, let's keep local store synced just in case
        if (backendResponse.ok && body.theme) {
            try {
                const { setTheme } = await import('../../../lib/store/themeStore');
                setTheme(body.theme);
            } catch (e) {
                // ignore local store error
            }
        }

        return NextResponse.json(data, { status: backendResponse.status });

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
        const cookies = request.cookies;
        const cookieHeader = cookies.toString();

        // Try getting from backend first
        try {
            const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/menu-theme`, {
                headers: {
                    'Cookie': cookieHeader
                }
            });

            if (backendResponse.ok) {
                const data = await backendResponse.json();
                return NextResponse.json(data, {
                    headers: {
                        'Cache-Control': 'no-store, max-age=0, must-revalidate'
                    }
                });
            }
        } catch (e) {
            console.warn('Backend theme fetch failed, falling back to local store');
        }

        // Fallback to local store if backend fails or 404s
        // This is necessary because the backend persistence seems unreliable for this session
        const { getTheme } = await import('../../../lib/store/themeStore');
        const theme = getTheme();

        return NextResponse.json({ theme }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate'
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
