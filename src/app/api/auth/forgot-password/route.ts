import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL from environment variables
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

// Type definition for forgot password request body
interface ForgotPasswordRequestBody {
    email: string;
}

// Type definition for backend response
interface ForgotPasswordResponse {
    message: string;
}

export async function POST(request: NextRequest) {
    try {
        // Parse the incoming request body
        const body: ForgotPasswordRequestBody = await request.json();

        // Validate required fields
        if (!body.email) {
            return NextResponse.json(
                {
                    message: 'Email adresi gereklidir',
                    error: 'VALIDATION_ERROR'
                },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                {
                    message: 'Geçerli bir email adresi giriniz',
                    error: 'VALIDATION_ERROR'
                },
                { status: 400 }
            );
        }

        // Forward the request to the backend
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                email: body.email,
            }),
        });

        // Get the response body
        let responseData: ForgotPasswordResponse | { message?: string; error?: string };

        try {
            responseData = await backendResponse.json();
        } catch (error) {
            // Handle non-JSON responses
            const textResponse = await backendResponse.text();
            return NextResponse.json(
                {
                    message: 'Şifre sıfırlama servisiyle iletişim kurulamadı',
                    error: 'INVALID_RESPONSE',
                    details: textResponse
                },
                { status: 502 }
            );
        }

        // Return response with the same status code as backend
        return NextResponse.json(
            responseData,
            { status: backendResponse.status }
        );

    } catch (error) {
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                {
                    message: 'Şifre sıfırlama servisine bağlanılamıyor',
                    error: 'SERVICE_UNAVAILABLE'
                },
                { status: 503 }
            );
        }

        // Handle JSON parsing errors from request
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    message: 'Geçersiz istek formatı',
                    error: 'INVALID_JSON'
                },
                { status: 400 }
            );
        }

        // Generic error response
        return NextResponse.json(
            {
                message: 'Beklenmeyen bir hata oluştu',
                error: 'INTERNAL_ERROR'
            },
            { status: 500 }
        );
    }
}
