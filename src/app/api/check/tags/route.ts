import { NextApiRequest, NextApiResponse } from "next";
import Error from "next/error";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextResponse } from "next/server";


export const GET = async (req:NextApiRequest,res :NextApiResponse)=>{
    try{
        
        const { searchParams } = new URL(req?.url);
        const tag = searchParams.get('tag');
        const payload = await getPayload({
            config: configPromise,
          });
       const query = await payload.find({
        collection:'tags',
        where:{
            tag:{
                equals:tag
            }
        }
       })
  return NextResponse.json(query)

    }catch (err:any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}