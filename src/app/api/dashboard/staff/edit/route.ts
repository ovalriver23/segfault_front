import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    // 1. Get ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 2. Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('JWT_TOKEN');

    if (!token) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Personel ID gerekli' },
        { status: 400 }
      );
    }

    // 3. Format auth header
    const authHeader = token.value.startsWith('Bearer ')
      ? token.value
      : `Bearer ${token.value}`;

    // 4. Get FormData from request (frontend sends FormData directly)
    const formData = await request.formData();

    // 5. Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'gender'];
    for (const field of requiredFields) {
      const value = formData.get(field);
      if (!value || (typeof value === 'string' && !value.trim())) {
        return NextResponse.json(
          { error: `${field} alanı zorunludur` },
          { status: 400 }
        );
      }
    }

    // 6. Send to backend (API 7.4: PUT /api/manager/staff/{staffId} with multipart/form-data)
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/manager/staff/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        // Content-Type is automatically set by FormData with boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend Staff Update Error:', data);
      return NextResponse.json(
        { error: data.error || data.message || 'Personel güncellenemedi' },
        { status: response.status }
      );
    }

    // 7. Return success
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Staff Edit Route Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}