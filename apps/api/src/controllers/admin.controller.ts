import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "@repo/db";
import { createAvatarSchema, createElementSchema, createMapSchema, updateElementSchema } from "../validators/admin.validate";
import { boolean } from "zod";

function checkOverlap(sizes:Array<{height:number,width:number}>, positions:Array<{x:number,y:number}> ):boolean {
    for (let i = 0; i < sizes.length; i++) {
        const {height : height1,width :width1}= sizes[i];
        const {x:x1, y:y1} = positions[i];

        for (let j = i + 1; j < sizes.length; j++) {
            const {height:height2, width:width2}= sizes[j];
            const {x:x2, y:y2} = positions[j];

            const Overlap = !((x1 + width1 <= x2 ||x2 + width2 <= x1) &&
                               (y1 + height1 <= y2 || y2 + height2 <= y1));

            if (Overlap) {
                return true;
            }
        }
    }
    return false;
}

const CreateElement = asyncHandler(async (req:Request, res:Response) => {
const {imageUrl,width,height,staticc}   = req.body;
const validate = createElementSchema.safeParse({imageUrl,width,height,staticc})
if(!validate.success){
    return res.status(400).json({message:validate.error.message})
}

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
const validate = updateElementSchema.safeParse({imageUrl,id})
if(!validate.success){
    return res.status(400).json({message:validate.error.message})
}

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
const createAvatar = asyncHandler(async (req:Request, res:Response) => {
    const {imageUrl,name} = req.body;
    const validate = createAvatarSchema.safeParse({imageUrl,name})
    if(!validate.success){
        return res.status(400).json({message:validate.error.message})
    }
    const createAvatar = await prisma.avatar.create({
        data:{
            imageUrl,
            name
        }
    })
    if(createAvatar){
        return res.status(200).json({avatarId:createAvatar.id})
    }
    return res.status(400).json({message:"Avatar not created"})
    })

const createMap = asyncHandler(async (req:Request, res:Response) => {
    const {thumbnail,dimensions,defaultElements,name} = req.body;
    const validate = createMapSchema.safeParse({thumbnail,dimensions,defaultElements,name})
    if(!validate.success){
        return res.status(400).json({message:validate.error.message})
    }
    if (dimensions.split("x").length !== 2){
        return res.status(400).json({message:"Invalid dimensions"})
    }
    try {
        const result = await prisma.$transaction(async (prisma) => {
        const createMap = await prisma.map.create({
            data:{
                thumbnailImageUrl:thumbnail,
                height: dimensions.split("x")[0],
                width: dimensions.split("x")[1],
                name:name,
                userId: req.user.id,
            }
        });
        let position:Array<{x:number,y:number}> =[]
    
        defaultElements.map(async (element:{x:number,y:number}) => {
            position.push(
                {
                    x:element.x,
                    y:element.y,
                }
            )
            
        });
        let elements: Array<{height:number,width:number}>= [];
     defaultElements.map(async (element:{id:string}) => {
            
              const data =   await prisma.element.findFirst({
                    where:{
                        id:element.id
                    }
                })
                if (data){
                    elements.push({height:data.height,width:data.width})
                }
                else {
                    throw new Error("Element not found")
                }
        });
      const overlap=  checkOverlap(elements,position)
      if (overlap){
          throw new Error("Overlap found")
      }
        defaultElements.map(async (element:{id:string,x:number,y:number}) => {
            await prisma.mapElements.create({
                data:{
                    elementId:element.id,
                    mapId:createMap.id,
                    x:element.x,
                    y:element.y
                }
            })
        })
        return createMap;
    })
    } catch (error:any) {
        return res.status(400).json({message:error.message})
        
    }
    return res.status(200).json({message:"Map created"})
    })

export {CreateElement,updateElement,createAvatar,createMap}