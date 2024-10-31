import { Request,Response } from "express"
import prisma from "@repo/db"
import { addElementToSpaceSchema, createSpaceSchema, deleteElementFromSpaceSchema } from "../validators/space.validator";
import { asyncHandler } from "../utils/asyncHandler";


function checkSpaceElementOverLap(element:Array<{height:number,width:number ,x:number,y:number}>,newElement :{height:number,width:number ,x:number,y:number}  ):boolean {
    
        const {height : height1,width :width1}= newElement;
        const {x:x1, y:y1} = newElement;

        for (let j = 0; j < element.length; j++) {
            const {height:height2, width:width2}= element[j];
            const {x:x2, y:y2} = element[j];

            const Overlap = !((x1 + width1 <= x2 ||x2 + width2 <= x1) &&
                               (y1 + height1 <= y2 || y2 + height2 <= y1));

            if (Overlap) {
                return true;
            }
        }
    return false;
}


const createSpace = asyncHandler(async (req: Request, res: Response) => {   
    const {name,dimensions,mapId,thumbnail} = req.body;
    const validate = createSpaceSchema.safeParse({name,dimensions,mapId})
    if(!validate.success){
        return res.status(400).json({message:validate.error.message})
    }
    if(dimensions.length !== 2){
        return res.status(400).json({message:"Invalid dimensions"})
    }

    const createSpace = await prisma.space.create({
        data:{
            name,
            height:dimensions.split("x")[0],
            width:dimensions.split("x")[1],
            mapId,
            thumbnail,
            userId:req.user.id
        }
    })
    if(createSpace){
        return res.status(200).json({spaceId:createSpace.id})
    }
    return res.status(400).json({message:"Space not created"})
});

const deleteSpace = asyncHandler(async (req: Request, res: Response) => {
    const {id} = req.params;
    const deleteSpace = await prisma.space.delete({
        where:{
            id
        }
    })
    if(deleteSpace){
        return res.status(200).json({spaceId:deleteSpace.id})
    }
    return res.status(400).json({message:"Space not deleted"})
});

const getSpace = asyncHandler(async (req: Request, res: Response) => {
    const space = await prisma.space.findMany()
    if (!space){
        return res.status(400).json({message:"Space not found"})
    }
    return res.status(200).json({spaces:space.map((space)=>({
        id:space.id, dimensions:`${space.height}x${space.width}`,name:space.name,thumbnail:space.thumbnail
    }))

});
});
const getSpaceById = asyncHandler(async (req: Request, res: Response) => {
    const {id} = req.params;
    const space = await prisma.space.findFirst({
        where:{
            id
        },
    select:{
        height:true,
        width:true,
        name:true,
        thumbnail:true,
        elements:{
            select:{
                id:true,
                elementId:true,
                element:{
                    select:{
                        imageUrl:true,
                        height:true,
                        width:true,
                        static:true
                    }
                },
                x:true,
                y:true
            }
        },
    }
    })
    if (!space){
        return res.status(400).json({message:"Space not found"})
    }
    return res.status(200).json({dimensions:`${space.height}x${space.width}`,name:space.name,thumbnail:space.thumbnail ,elements:space.elements.map((element)=>({id:element.id,element:{id:element.elementId,imageUrl:element.element.imageUrl,height:element.element.height,width:element.element.width,static:element.element.static},x:element.x,y:element.y}))})

});


const addElementToSpace = asyncHandler(async (req: Request, res: Response) => {
    const {spaceId,elementId,x,y} = req.body;
    const validate = addElementToSpaceSchema.safeParse({spaceId,elementId,x,y})
    if(!validate.success){
        return res.status(400).json({message:validate.error.message})
    }
    const space = await prisma.space.findFirst({
        where:{
            id:spaceId
        }
    })
    if(!space){
        return res.status(400).json({message:"Space not found"})
    }
    if(space.userId !== req.user.id){
        return res.status(400).json({message:"Space not owned by user"})
    }

    const element = await prisma.element.findFirst({
        where:{
            id:elementId
        },select:{
            id:true,
            width:true,
            height:true
        }

    })

    if(!element){
        return res.status(400).json({message:"Element not found"})
    }
    const newElement = {x:x,y:y,width:element.width,height:element.height}
   const elements :Array<{x:number,y:number,width:number,height:number}>= []
   const spaceElements = await prisma.spaceElements.findMany({
         where:{
              spaceId
         }
        })
    if(spaceElements){
        spaceElements.map((item)=>{
            elements.push({x:item.x,y:item.y,width:element.width,height:element.height})
        })
    }
   const overlap=  checkSpaceElementOverLap(elements,newElement)
   if (overlap){
       return res.status(400).json({message:"Element overlap"})
    }
    const createSpaceElement = await prisma.spaceElements.create({
        data:{
            spaceId,
            elementId,
            x,
            y
        }
    })
    if(createSpaceElement){
        return res.status(200).json({elementId:createSpaceElement.id})
    }
    return res.status(400).json({message:"Element not added to space"})
});

const deleteElementFromSpace = asyncHandler(async (req: Request, res: Response) => {
    const {spaceId,elementId} = req.body;
    const validate = deleteElementFromSpaceSchema.safeParse({spaceId,elementId})
    if(!validate.success){
        return res.status(400).json({message:validate.error.message})
    }
    const space = await prisma.space.findFirst({
        where:{
            id:spaceId
        }
    })
    if(!space){
        return res.status(400).json({message:"Space not found"})
    }
    if(space.userId !== req.user.id){
        return res.status(400).json({message:"Space not owned by user"})
    }

    const deleteSpaceElement = await prisma.spaceElements.delete({
        where:{
                spaceId,
                id:elementId,

        }
    })
    if(deleteSpaceElement){
        return res.status(200).json({elementId:deleteSpaceElement.id})
    }
    return res.status(400).json({message:"Element not deleted from space"})
});

const getSpaceElement = asyncHandler(async (req: Request, res: Response) => {
    const {spaceId} = req.params;
    const spaceElement = await prisma.spaceElements.findMany({
        where:{
            spaceId
        },
        select:{
            id:true,
            x:true,
            y:true,
            element:{
                select:{
                    imageUrl:true,
                    
            }
        }
}})
    if (!spaceElement){
        return res.status(400).json({message:"Space element not found"})
    }
    return res.status(200).json({elements:spaceElement.map((element)=>({id:element.id,x:element.x,y:element.y}))})
});