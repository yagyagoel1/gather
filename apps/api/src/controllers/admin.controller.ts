import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "@repo/db";

const CreateElement = asyncHandler(async (req:Request, res:Response) => {
const {imageUrl,width,height,staticc}   = req.body;

const createElement = await prisma.element.create({
    data:{
        imageUrl,
        width,
        height,
        static:staticc
    }
})
if(createElement){
    return res.status(200).json({id:createElement.id})
}
return res.status(400).json({message:"Element not created"})
})

const updateElement = asyncHandler(async (req:Request, res:Response) => {
const {imageUrl} = req.body;
const {id} = req.params;

const updateElement = await prisma.element.update({
    where:{
        id
    },
    data:{
        imageUrl,
    }
})
if(updateElement){
    return res.status(200).json({id:updateElement.id})
}
return res.status(400).json({message:"Element not updated"})
})