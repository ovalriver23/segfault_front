import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
	const cookieStore = await cookies()
	const token = cookieStore.get('JWT_TOKEN')?.value

	if (!token) {
		return NextResponse.json(
			{
				message: 'Yetkisiz istek. Lütfen tekrar giriş yapın.',
				error: 'UNAUTHORIZED',
			},
			{ status: 401 }
		)
	}

	let payload: unknown
	try {
		payload = await request.json()
	} catch (error) {
		return NextResponse.json(
			{
				message: 'Geçersiz JSON gövdesi',
				error: 'INVALID_BODY',
			},
			{ status: 400 }
		)
	}

	try {
		const backendResponse = await fetch(
			`${BACKEND_API_URL}/api/manager/menu/categories`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json;charset=UTF-8',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			}
		)

		const contentType = backendResponse.headers.get('content-type')
		const responseBody = contentType?.includes('application/json')
			? await backendResponse.json()
			: { message: await backendResponse.text() }

		return NextResponse.json(responseBody, {
			status: backendResponse.status,
		})
	} catch (error) {
		return NextResponse.json(
			{
				message: 'Kategori servisine ulaşılamıyor',
				error: 'SERVICE_UNAVAILABLE',
			},
			{ status: 503 }
		)
	}
}

export async function GET() {
	return NextResponse.json(
		{
			message: 'Kategori listeleme uç noktası henüz uygulanmadı.',
			error: 'NOT_IMPLEMENTED',
		},
		{ status: 501 }
	)
}