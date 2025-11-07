import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL from environment variables
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

// Type definition for signup request body
interface SignUpRequestBody {
  username: string;
  email: string;
  password: string;
  restaurantName: string;
  restaurantLocation: string;
}

// Type definition for backend response
interface SignUpResponse {
  token: string;
  username: string;
  role: string;
  hasRestaurant: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body: SignUpRequestBody = await request.json();

    // Validate required fields
    const requiredFields: (keyof SignUpRequestBody)[] = [
      'username',
      'email',
      'password',
      'restaurantName',
      'restaurantLocation'
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

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        username: body.username,
        email: body.email,
        password: body.password,
        restaurantName: body.restaurantName,
        restaurantLocation: body.restaurantLocation,
      }),
      credentials: 'include', // Important for handling cookies
    });

    // Get the response body
    let responseData: SignUpResponse | { message?: string; error?: string };
    
    try {
      responseData = await backendResponse.json();
    } catch (error) {
      // Handle non-JSON responses
      const textResponse = await backendResponse.text();
      return NextResponse.json(
        {
          message: 'Invalid response from authentication service',
          error: 'INVALID_RESPONSE',
          details: textResponse
        },
        { status: 502 }
      );
    }

    // Extract Set-Cookie headers from backend response
    const setCookieHeader = backendResponse.headers.get('set-cookie');

    // Create response with the same status code as backend
    const response = NextResponse.json(
      responseData,
      { status: backendResponse.status }
    );

    // Forward the Set-Cookie header to the client
    if (setCookieHeader) {
      response.headers.set('Set-Cookie', setCookieHeader);
    }

    return response;

  } catch (error) {
    // Handle network errors and other exceptions
    console.error('Sign-up proxy error:', error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          message: 'Unable to connect to authentication service',
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
        message: 'An unexpected error occurred during sign-up',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
