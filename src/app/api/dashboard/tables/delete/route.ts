import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';


interface DeleteTableReqBody {
    id: string;
}

interface DeleteTableResBody {
    message: string;
}

export async function DELETE(request: NextRequest) {
    try {
        const body: DeleteTableReqBody = await request.json();

        if (!body.id) {
            return NextResponse.json(
                {
                    message: 'Table ID is required',
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

        const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/tables/${body.id}`, {
            method: 'DELETE',
            headers,
        });

        let responseData: DeleteTableResBody | { message?: string; error?: string };
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

        // Handle 400 error from backend
        if (backendResponse.status === 400) {
            const errorMessage = 'error' in responseData ? responseData.error : 'Masa silinirken bir hata oluştu.';
            return NextResponse.json(
                {
                    message: errorMessage,
                    error: 'TABLE_DELETE_ERROR'
                },
                { status: 400 }
            );
        }

        // Handle 404 error from backend (table not found)
        if (backendResponse.status === 404) {
            return NextResponse.json(
                {
                    message: 'Masa bulunamadı.',
                    error: 'TABLE_NOT_FOUND'
                },
                { status: 404 }
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
                message: 'An unexpected error occurred while deleting table',
                error: 'INTERNAL_ERROR'
            },
            { status: 500 }
        );
    }
}
