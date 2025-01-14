import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const id = searchParams.get('id')
	const imageUrl = searchParams.get('imageUrl')

	if (imageUrl) {
		try {
			const response = await axios.get(imageUrl, {
				responseType: 'arraybuffer'
			})
			return new NextResponse(response.data)
		} catch (error) {
			console.error('Image proxy error:', error)
			return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
		}
	}

	if (!id) {
		return NextResponse.json({ error: 'ID is required' }, { status: 400 })
	}

	try {
		const response = await axios.get(`https://www.wowweekend.vn/api/article?id=${id}`)
		return NextResponse.json(response.data)
	} catch (error) {
		console.error('Proxy error:', error)
		return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
	}
}