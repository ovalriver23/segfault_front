import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

/**
 * PUT /api/Superadmin/restaurants/[id]/unban
 * Endpoint - Restoran Banını Kaldır
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookies = request.cookies;
        const cookieHeader = cookies.toString();

        const backendResponse = await fetch(
            `${BACKEND_API_URL}/api/superadmin/restaurants/${id}/unban`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Cookie': cookieHeader,
                },
            }
        );

        const responseData = await backendResponse.json().catch(() => ({}));
        return NextResponse.json(responseData, { status: backendResponse.status });

    } catch (error) {
        console.error('Error unbanning restaurant:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
