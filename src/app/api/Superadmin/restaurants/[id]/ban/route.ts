import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

/**
 * PUT /api/Superadmin/restaurants/[id]/ban
 * Endpoint 11.5 - Restoran Yasakla (Ban)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookies = request.cookies;
        const cookieHeader = cookies.toString();

        // Get request body
        const body = await request.json();

        const backendResponse = await fetch(
            `${BACKEND_API_URL}/api/superadmin/restaurants/${id}/ban`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Cookie': cookieHeader,
                },
                body: JSON.stringify(body),
            }
        );

        const responseData = await backendResponse.json().catch(() => ({}));
        return NextResponse.json(responseData, { status: backendResponse.status });

    } catch (error) {
        console.error('Error banning restaurant:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
