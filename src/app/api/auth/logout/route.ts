import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

interface LogoutResponse {
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const jwtToken = cookieStore.get('JWT_TOKEN')?.value;

  if (!jwtToken) {
    return NextResponse.json(
      {
        message: 'You are not logged in',
        error: 'INVALID_REQUEST'
      },
      { status: 400 }
    );
  }

  try {
    // Forward logout request to backend with JWT token
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      credentials: 'include'
    });

    const responseData: LogoutResponse = await backendResponse.json();

    // Create response and delete JWT cookie regardless of backend status
    const response = NextResponse.json(
      responseData,
      { status: backendResponse.status }
    );
    
    response.cookies.delete('JWT_TOKEN');
    return response;

  } catch (error) {
    // Even if backend fails, clear the cookie client-side
    const response = NextResponse.json(
      {
        message: 'Logout completed (backend unavailable)',
        error: 'BACKEND_ERROR'
      },
      { status: 200 } // Still return 200 since we cleared the cookie
    );
    
    response.cookies.delete('JWT_TOKEN');
    return response;
  }
}