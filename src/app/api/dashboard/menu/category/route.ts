import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL from environment variables
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

// Type definition for create category request body
interface CreateCategoryRequestBody {
  name: string;
}

// Type definition for update category request body
interface UpdateCategoryRequestBody {
  name: string;
}

// Type definition for backend response
interface CreateCategoryResponse {
  id: number;
  name: string;
  menuItems: any[];
  restaurantId: string;
}

// Type definition for list categories response
interface Category {
  id: number;
  name: string;
  menuItems: any[];
  restaurantId: string;
}

type ListCategoriesResponse = Category[];

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body: CreateCategoryRequestBody = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          message: 'Missing required field: name',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Get JWT token from cookies
    const jwtToken = request.cookies.get('JWT_TOKEN')?.value;

    if (!jwtToken) {
      return NextResponse.json(
        {
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/menu/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Cookie': `JWT_TOKEN=${jwtToken}`,
      },
      body: JSON.stringify({
        name: body.name,
      }),
      credentials: 'include', // Important for handling cookies
    });

    // Get the response body
    let responseData: CreateCategoryResponse | { message?: string; error?: string };
    
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

    // Create response with the same status code as backend
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
        message: 'An unexpected error occurred while creating category',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const jwtToken = request.cookies.get('JWT_TOKEN')?.value;

    if (!jwtToken) {
      return NextResponse.json(
        {
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/menu/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Cookie': `JWT_TOKEN=${jwtToken}`,
      },
      credentials: 'include', // Important for handling cookies
    });

    // Get the response body
    let responseData: ListCategoriesResponse | { message?: string; error?: string };
    
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

    // Create response with the same status code as backend
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

    // Generic error response
    return NextResponse.json(
      {
        message: 'An unexpected error occurred while fetching categories',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get category ID from URL
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        {
          message: 'Missing required parameter: id',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Parse the incoming request body
    const body: UpdateCategoryRequestBody = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          message: 'Missing required field: name',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Get JWT token from cookies
    const jwtToken = request.cookies.get('JWT_TOKEN')?.value;

    if (!jwtToken) {
      return NextResponse.json(
        {
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/menu/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Cookie': `JWT_TOKEN=${jwtToken}`,
      },
      body: JSON.stringify({
        name: body.name,
      }),
      credentials: 'include',
    });

    // Get the response body
    let responseData: CreateCategoryResponse | { message?: string; error?: string };
    
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

    // Create response with the same status code as backend
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
        message: 'An unexpected error occurred while updating category',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get category ID from URL
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        {
          message: 'Missing required parameter: id',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Get JWT token from cookies
    const jwtToken = request.cookies.get('JWT_TOKEN')?.value;

    if (!jwtToken) {
      return NextResponse.json(
        {
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/menu/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Cookie': `JWT_TOKEN=${jwtToken}`,
      },
      credentials: 'include',
    });

    // Get the response body
    let responseData: { message?: string; error?: string };
    
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

    // Create response with the same status code as backend
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

    // Generic error response
    return NextResponse.json(
      {
        message: 'An unexpected error occurred while deleting category',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
