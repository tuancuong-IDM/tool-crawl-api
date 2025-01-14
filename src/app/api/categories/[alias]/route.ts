import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";



export const GET = async (req:NextApiRequest,{ params }: { params: Promise<{ alias: string }> }) =>{
  try{

    const payload = await getPayload({
      config: configPromise,
    });
    const alias = (await params).alias
    const categoryQuery = await payload.find({
      collection: 'categories',
      where: {
        alias: {
          equals: alias
        }
      }
    })
    if(categoryQuery.docs.length == 0){
      return NextResponse.json({
        status: 404,
        msg: 'Category not found',
        data_cat:categoryQuery.docs,
        data:[],
      })
    }
    
    const dataArticle = await payload.find({
      collection: 'article',
      where: {
        cat_id: {
          equals: categoryQuery.docs[0].id
        }
      }
    })
    
    if(dataArticle.totalDocs == 0){
      return NextResponse.json({
        status: 404,
        msg: 'Article not found',
        data_cat:categoryQuery.docs,
        data: [],
      })
    }
    
    return NextResponse.json({
      status: 200,
      msg: 'Success',
      data_cat: categoryQuery.docs,
      data: dataArticle.docs,
    })
  }catch(err){
    return NextResponse.json({'msg':'Internal Server Error'})
  }
}