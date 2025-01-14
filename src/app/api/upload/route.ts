import { Category } from '@/payload-types'
import { NextResponse } from 'next/server'
import { getPayload } from "payload";
import configPromise from "@payload-config";

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const payload = await getPayload({
      config: configPromise,
    });
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}-${randomString}.jpg`

    const media =  payload.create({
      collection: 'media',
      data: {
        alt: 'Uploaded image',
      },
      file: file,
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
