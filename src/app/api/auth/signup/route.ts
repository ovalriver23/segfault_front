import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL from environment variables
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

// Type definition for backend response
interface SignUpResponse {
  token: string;
  username: string;
  role: string;
  hasRestaurant: boolean;
  profilePhotoUrl?: string | null;
  restaurantLogoUrl?: string | null;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming FormData
    const formData = await request.formData();

    // Extract required fields
    const username = formData.get('username')?.toString();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const restaurantName = formData.get('restaurantName')?.toString();
    const restaurantLocation = formData.get('restaurantLocation')?.toString();
    const latitude = formData.get('latitude')?.toString();
    const longitude = formData.get('longitude')?.toString();

    // Validate required fields
    const requiredFields = {
      username,
      email,
      password,
      restaurantName,
      restaurantLocation,
      latitude,
      longitude,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: `Missing required fields: ${missingFields.join(', ')}`,
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Validate latitude and longitude
    const lat = parseFloat(latitude!);
    const lng = parseFloat(longitude!);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return NextResponse.json(
        {
          message: 'Invalid latitude value. Must be between -90 and 90.',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          message: 'Invalid longitude value. Must be between -180 and 180.',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Create FormData for backend request
    const backendFormData = new FormData();
    backendFormData.append('username', username!);
    backendFormData.append('email', email!);
    backendFormData.append('password', password!);
    backendFormData.append('restaurantName', restaurantName!);
    backendFormData.append('restaurantLocation', restaurantLocation!);
    backendFormData.append('latitude', latitude!);
    backendFormData.append('longitude', longitude!);

    // Optional: Add profile photo if provided
    const profilePhoto = formData.get('profilePhoto');
    if (profilePhoto && profilePhoto instanceof File && profilePhoto.size > 0) {
      backendFormData.append('profilePhoto', profilePhoto);
    }

    // Optional: Add restaurant logo if provided
    const restaurantLogo = formData.get('restaurantLogo');
    if (restaurantLogo && restaurantLogo instanceof File && restaurantLogo.size > 0) {
      backendFormData.append('restaurantLogo', restaurantLogo);
    }

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/signup`, {
      method: 'POST',
      body: backendFormData,
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
          details: textResponse,
        },
        { status: 502 }
      );
    }

    // Create response with the same status code as backend
    const response = NextResponse.json(
      responseData,
      { status: backendResponse.status }
    );

    // New restaurants must wait for manual approval. Do not forward the
    // backend session cookie, and clear any stale JWT on successful signup.
    if (backendResponse.ok) {
      response.cookies.delete('JWT_TOKEN');
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
