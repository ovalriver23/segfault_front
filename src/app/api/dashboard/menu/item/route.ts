import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL from environment variables
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

// Type definition for create menu item request body
interface CreateMenuItemRequestBody {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  style?: string;
  categoryId: number;
  cancellable?: boolean;
  cancellationDuration?: number;
  file?: File;
}

// Type definition for update menu item request body
interface UpdateMenuItemRequestBody {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  style?: string;
  available: boolean;
  cancellable?: boolean;
  cancellationDuration?: number;
  file?: File;
}

// Type definition for update availability request body
interface UpdateAvailabilityRequestBody {
  available: boolean;
}

// Type definition for menu item response
interface MenuItemResponse {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  style: string | null;
  available: boolean;
  categoryId: number;
  categoryName: string;
}

// Type definition for list menu items response
type ListMenuItemsResponse = MenuItemResponse[];

// Type definition for organized menu by category
interface OrganizedMenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  style: string | null;
  available: boolean;
}

interface CategoryWithItems {
  categoryId: number;
  categoryName: string;
  items: OrganizedMenuItem[];
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
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/menu/items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Cookie': `JWT_TOKEN=${jwtToken}`,
      },
      credentials: 'include',
    });

    // Get the response body
    let responseData: ListMenuItemsResponse | { message?: string; error?: string };
    
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

    // If response is not successful, return as is
    if (!backendResponse.ok || !Array.isArray(responseData)) {
      return NextResponse.json(
        responseData,
        { status: backendResponse.status }
      );
    }

    // Organize items by category
    const categoriesMap = new Map<number, CategoryWithItems>();
    
    responseData.forEach((item: MenuItemResponse) => {
      if (!categoriesMap.has(item.categoryId)) {
        categoriesMap.set(item.categoryId, {
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          items: []
        });
      }
      
      const category = categoriesMap.get(item.categoryId)!;
      category.items.push({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        style: item.style,
        available: item.available
      });
    });

    // Convert map to array and sort by category name
    const organizedData = Array.from(categoriesMap.values()).sort((a, b) => 
      a.categoryName.localeCompare(b.categoryName)
    );

    // Create response with organized data
    const response = NextResponse.json(
      organizedData,
      { status: 200 }
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
        message: 'An unexpected error occurred while fetching menu items',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming multipart form data
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const categoryId = formData.get('categoryId') as string;
    const style = formData.get('style') as string;
    const cancellable = formData.get('cancellable') as string;
    const cancellationDuration = formData.get('cancellationDuration') as string;
    const file = formData.get('file') as File | null;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        {
          message: 'Missing required field: name',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    if (!price) {
      return NextResponse.json(
        {
          message: 'Missing required field: price',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          message: 'Missing required field: categoryId',
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

    // Create multipart form data for backend
    const backendFormData = new FormData();
    backendFormData.append('name', name);
    if (description) backendFormData.append('description', description);
    backendFormData.append('price', price);
    if (style) backendFormData.append('style', style);
    if (cancellable) backendFormData.append('cancellable', cancellable);
    if (cancellationDuration) backendFormData.append('cancellationDuration', cancellationDuration);
    if (file) backendFormData.append('file', file);

    // Forward the request to the backend
    const backendResponse = await fetch(
      `${BACKEND_API_URL}/api/manager/menu/categories/${categoryId}/items`,
      {
        method: 'POST',
        headers: {
          'Cookie': `JWT_TOKEN=${jwtToken}`,
        },
        body: backendFormData,
        credentials: 'include',
      }
    );

    // Get the response body
    let responseData: MenuItemResponse | { message?: string; error?: string };

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
        message: 'An unexpected error occurred while creating menu item',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get item ID from URL
    const url = new URL(request.url);
    const itemId = url.searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        {
          message: 'Missing required parameter: id',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Parse the incoming multipart form data
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const style = formData.get('style') as string;
    const available = formData.get('available') as string;
    const cancellable = formData.get('cancellable') as string;
    const cancellationDuration = formData.get('cancellationDuration') as string;
    const file = formData.get('file') as File | null;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        {
          message: 'Missing required field: name',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    if (!price) {
      return NextResponse.json(
        {
          message: 'Missing required field: price',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    if (!available) {
      return NextResponse.json(
        {
          message: 'Missing required field: available',
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

    // Create multipart form data for backend
    const backendFormData = new FormData();
    backendFormData.append('name', name);
    if (description) backendFormData.append('description', description);
    backendFormData.append('price', price);
    if (style) backendFormData.append('style', style);
    backendFormData.append('available', available);
    if (cancellable) backendFormData.append('cancellable', cancellable);
    if (cancellationDuration) backendFormData.append('cancellationDuration', cancellationDuration);
    if (file) backendFormData.append('file', file);

    // Forward the request to the backend
    const backendResponse = await fetch(
      `${BACKEND_API_URL}/api/manager/menu/items/${itemId}`,
      {
        method: 'PUT',
        headers: {
          'Cookie': `JWT_TOKEN=${jwtToken}`,
        },
        body: backendFormData,
        credentials: 'include',
      }
    );

    // Get the response body
    let responseData: MenuItemResponse | { message?: string; error?: string };

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
        message: 'An unexpected error occurred while updating menu item',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get item ID from URL
    const url = new URL(request.url);
    const itemId = url.searchParams.get('id');

    if (!itemId) {
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
    const backendResponse = await fetch(
      `${BACKEND_API_URL}/api/manager/menu/items/${itemId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Cookie': `JWT_TOKEN=${jwtToken}`,
        },
        credentials: 'include',
      }
    );

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
        message: 'An unexpected error occurred while deleting menu item',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get item ID from URL
    const url = new URL(request.url);
    const itemId = url.searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        {
          message: 'Missing required parameter: id',
          error: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Parse the incoming request body
    const body: UpdateAvailabilityRequestBody = await request.json();

    // Validate required fields
    if (body.available === undefined || body.available === null) {
      return NextResponse.json(
        {
          message: 'Missing required field: available',
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
    const backendResponse = await fetch(
      `${BACKEND_API_URL}/api/manager/menu/items/${itemId}/availability`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Cookie': `JWT_TOKEN=${jwtToken}`,
        },
        body: JSON.stringify({
          available: body.available,
        }),
        credentials: 'include',
      }
    );

    // Get the response body
    let responseData: MenuItemResponse | { message?: string; error?: string };

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
        message: 'An unexpected error occurred while updating availability',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
