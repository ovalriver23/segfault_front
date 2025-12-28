import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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

    // 3. Get FormData from request (frontend sends FormData directly)
    const formData = await request.formData();

    // 4. Validate required fields
    const requiredFields = ['username', 'password', 'firstName', 'lastName', 'email', 'phoneNumber'];
    for (const field of requiredFields) {
      const value = formData.get(field);
      if (!value || (typeof value === 'string' && !value.trim())) {
        return NextResponse.json(
          { error: `${field} alanı zorunludur` },
          { status: 400 }
        );
      }
    }

    // 5. Set default gender if not provided
    if (!formData.get('gender')) {
      formData.set('gender', 'MALE');
    }

    // 6. Send to backend
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/manager/staff`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        // Content-Type is automatically set by FormData with boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend Staff Create Error:', data);
      return NextResponse.json(
        { error: data.error || data.message || 'Personel oluşturulamadı' },
        { status: response.status }
      );
    }

    // 7. Return success
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Staff Add Route Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}