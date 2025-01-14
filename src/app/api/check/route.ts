import { NextApiRequest, NextApiResponse } from "next";
import Error from "next/error";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextResponse } from "next/server";


export const GET = async (req:NextApiRequest,res :NextApiResponse)=>{
    try{
        
        const { searchParams } = new URL(req?.url);
        const alias = searchParams.get('alias');
        const payload = await getPayload({
            config: configPromise,
          });
       const query = await payload.count({
        collection:'article',
        where:{
            title_rewrite:{
                equals:alias
            }
        }
       })
  return NextResponse.json(query)

    }catch (err:any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}