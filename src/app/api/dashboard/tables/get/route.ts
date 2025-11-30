import { UUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';


interface getTableResBody {
    id: UUID;
    tableName: string;
    qrToken: UUID;
    capacity: number;
    tableStatus: string;
    restaurantId: UUID;
}


export async function GET(request:NextRequest) {

    try {
        // Get JWT token from request cookies
        const token = request.cookies.get('JWT_TOKEN')?.value;
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json;charset=UTF-8',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const backendResponse = await fetch(`${BACKEND_API_URL}/api/manager/tables`, {
            method: 'GET',
            headers,
        })

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch tables' },
                { status: backendResponse.status }
            );
        }

        const tables: getTableResBody[] = await backendResponse.json();
        //console.log(tables)

        return NextResponse.json(tables, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }


}