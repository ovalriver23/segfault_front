import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('JWT_TOKEN')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/api/staff/notifications/vapid-public-key`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('VAPID key alınamadı');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('VAPID Key Error:', error);
    return NextResponse.json(
      { message: 'VAPID key alınamadı' },
      { status: 500 }
    );
  }
}
