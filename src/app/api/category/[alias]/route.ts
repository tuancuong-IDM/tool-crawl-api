import { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from "payload";
import configPromise from "@payload-config";

export const GET = async (req: NextRequest,{ params }: { params: Promise<{ alias: string }> }) => {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const alias = (await params).alias
    
    const query = await payload.find({
      collection: 'categories',
      depth: 1,
      where: {
        alias: {
          equals: alias
        }
      }
    })
    
    return NextResponse.json(query.docs[0])
  } catch (err: any) {
    console.log(err);
    
    throw new Error('Error : ' + err)
  }
}
