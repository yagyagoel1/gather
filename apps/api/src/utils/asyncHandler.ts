
import type { NextFunction, Request, Response } from "express"


export const asyncHandler  = (requestHandler:any)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        try{
            await requestHandler(req,res,next)
        }catch(error){
            console.error("error in asyncHandler",error)
            res.status(500).json({message:"Internal Server Error"})
        }
    }
}