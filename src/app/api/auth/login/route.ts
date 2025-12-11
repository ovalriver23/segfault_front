import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.easyorder.com.tr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    console.log('Login request to backend:', `${BACKEND_API_URL}/api/auth/login`);

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
      }),
    });

    const data = await backendResponse.json();
    console.log('Backend response:', data);

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Giriş başarısız' },
        { status: backendResponse.status }
      );
    }

    // Create response with user data
    const response = NextResponse.json(data, { status: 200 });

    // Set JWT cookie if token exists
    if (data.token) {
      response.cookies.set('JWT_TOKEN', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}