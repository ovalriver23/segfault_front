import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

interface ForgotPasswordRequest {
    email: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: ForgotPasswordRequest = await request.json();

        // Validate email field
        if (!body.email) {
            return NextResponse.json(
                { message: 'E-posta adresi gereklidir.', error: 'VALIDATION_ERROR' },
                { status: 400 }
            );
        }

        // Forward request to backend
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({ email: body.email }),
        });

        let responseData;
        try {
            responseData = await backendResponse.json();
        } catch {
            const textResponse = await backendResponse.text();
            return NextResponse.json(
                { message: 'Sunucudan geçersiz yanıt alındı.', error: 'INVALID_RESPONSE', details: textResponse },
                { status: 502 }
            );
        }

        return NextResponse.json(responseData, { status: backendResponse.status });
    } catch (error) {
        console.error('Forgot password error:', error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                { message: 'Sunucuya bağlanılamıyor.', error: 'SERVICE_UNAVAILABLE' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { message: 'Beklenmeyen bir hata oluştu.', error: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
