import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL from environment variables
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

interface ResponseDataType {
    id: number;
    username: string;
    email: string | null;
    role: string;
    hasRestaurant: boolean;
    passwordChangeRequired: boolean;
}

export async function GET(request: NextRequest) {
    try {
        // Get cookies from the incoming request
        const cookies = request.cookies;
        const cookieHeader = cookies.toString();
        
        
        // Forward the request to the backend with cookies manually added
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/account/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Cookie': cookieHeader,
            },
        });

        // Get the response body
        let responseData: ResponseDataType | { message?: string; error?: string };
        
        try {
            responseData = await backendResponse.json();
        } catch (error) {
            // Handle non-JSON responses
            const textResponse = await backendResponse.text();
            return NextResponse.json(
                {
                    message: 'Invalid response from backend',
                    error: 'INVALID_RESPONSE',
                    details: textResponse
                },
                { status: 502 }
            );
        }

        // Return the response with the same status code as backend
        return NextResponse.json(
            responseData,
            { status: backendResponse.status }
        );

    } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                {
                    message: 'Unable to connect to backend service',
                    error: 'SERVICE_UNAVAILABLE'
                },
                { status: 503 }
            );
        }

        // Generic error response
        return NextResponse.json(
            {
                message: 'An unexpected error occurred while fetching user data',
                error: 'INTERNAL_ERROR',
                
            },
            { status: 500 }
        );
    }
}