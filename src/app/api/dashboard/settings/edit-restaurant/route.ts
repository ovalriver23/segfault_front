import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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

        // 3. Get FormData from request
        const formData = await request.formData();

        // 4. Validate at least one field is being updated
        const hasAnyField =
            formData.get('username') ||
            formData.get('email') ||
            formData.get('restaurantName') ||
            formData.get('restaurantLocation') ||
            formData.get('latitude') ||
            formData.get('longitude') ||
            formData.get('profilePhoto') ||
            formData.get('restaurantLogo');

        if (!hasAnyField) {
            return NextResponse.json(
                { error: 'En az bir alan güncellenmelidir' },
                { status: 400 }
            );
        }

        // 5. Validate latitude if provided
        const latitude = formData.get('latitude');
        if (latitude !== null && latitude !== '') {
            const lat = parseFloat(latitude as string);
            if (isNaN(lat) || lat < -90.0 || lat > 90.0) {
                return NextResponse.json(
                    { error: 'Enlem -90.0 ile 90.0 arasında olmalıdır' },
                    { status: 400 }
                );
            }
        }

        // 6. Validate longitude if provided
        const longitude = formData.get('longitude');
        if (longitude !== null && longitude !== '') {
            const lon = parseFloat(longitude as string);
            if (isNaN(lon) || lon < -180.0 || lon > 180.0) {
                return NextResponse.json(
                    { error: 'Boylam -180.0 ile 180.0 arasında olmalıdır' },
                    { status: 400 }
                );
            }
        }

        // 7. Send to backend
        const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
        const response = await fetch(`${backendUrl}/api/manager/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                // Content-Type is automatically set by FormData with boundary
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Backend Profile Update Error:', data);
            return NextResponse.json(
                { error: data.error || data.message || 'Profil güncellenemedi' },
                { status: response.status }
            );
        }

        // 8. Return success
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Edit Restaurant Route Error:', error);
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}
