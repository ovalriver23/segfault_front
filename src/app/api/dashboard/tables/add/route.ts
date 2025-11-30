import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';


interface AddTableReqBody {
    name: string
    capacity: number
}

interface AddTableResBody {
    id: string
    name: string
    qrToken: string
    capacity: number
    status: string
    restaurantId: string
}

export async function POST(request: NextRequest) {
    try {
        const body: AddTableReqBody = await request.json();

        const requiredFields: (keyof AddTableReqBody)[] = [
            'name',
            'capacity'
        ];

        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    message: `Missing required fields: ${missingFields.join(', ')}`,
                    error: 'VALIDATION_ERROR'
                },
                { status: 400 }
            );
        }

        // Get JWT token from request cookies
        const token = request.cookies.get('JWT_TOKEN')?.value;
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json;charset=UTF-8',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/tables`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: body.name,
                capacity: body.capacity
            })
        })

        let responseData: AddTableResBody | { message?: string; error?: string };
        try {
            responseData = await backendResponse.json();
        } catch (error) {
            // Handle non-JSON responses
            const textResponse = await backendResponse.text();
            return NextResponse.json(
                {
                    message: 'Invalid response from backend service',
                    error: 'INVALID_RESPONSE',
                    details: textResponse
                },
                { status: 502 }
            );
        }

        // Handle 400 error from backend (table already exists)
        if (backendResponse.status === 400) {
            const errorMessage = 'error' in responseData ? responseData.error : 'Böyle bir masa zaten var.';
            return NextResponse.json(
                {
                    message: errorMessage,
                    error: 'TABLE_ALREADY_EXISTS'
                },
                { status: 400 }
            );
        }

        const response = NextResponse.json(
            responseData,
            { status: backendResponse.status }
        );
        return response;

    } catch (error) {
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                {
                    message: 'Unable to connect to backend service',
                    error: 'SERVICE_UNAVAILABLE'
                },
                { status: 503 }
            );
        }

        // Handle JSON parsing errors from request
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    message: 'Invalid JSON in request body',
                    error: 'INVALID_JSON'
                },
                { status: 400 }
            );
        }

        // Generic error response
        return NextResponse.json(
            {
                message: 'An unexpected error occurred while adding table',
                error: 'INTERNAL_ERROR'
            },
            { status: 500 }
        );
    }
}


