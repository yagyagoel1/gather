import type { Request, Response } from "express";
import prisma ,{Role} from "@repo/db"
import { asyncHandler } from "../utils/asyncHandler";
import { signupSchema } from "../validators/index.validator";
import { compareHash, hashData } from "../utils/hashData";
import { createToken } from "../utils/jwtToken";



const postSignup = asyncHandler(async (req: Request, res: Response) => {
    const { username,password,type } = req.body;

  const validate=  signupSchema.safeParse({username,password,type})
    if(!validate.success){
        return res.status(400).json({message:validate.error.message})
    }
   const  hashedPassword = await hashData(password)
    const createUser = await prisma.user.create({
        data:{
            username,
            password:hashedPassword,
            role:type=="admin"?Role.admin:Role.user
        }
    })
    if (createUser){
        return res.status(201).json({userId:createUser.id})
    }
    return res.status(400).json({message:"User not created"})
});


const  postSignin = asyncHandler(async (req: Request, res: Response) => {
    const { username,password } = req.body;
    const validate=  signupSchema.safeParse({username,password})
    if(!validate.success){
        return res.status(400).json({message:validate.error.message})
    }
    const user = await prisma.user.findFirst({
        where:{
            username
        }
    })
    if(!user){
        return res.status(400).json({message:"User not found"})
    }
    if(!(await compareHash(password,user.password))){
        return res.status(400).json({message:"Invalid password"})
    }
    const token =createToken({id:user.id})
    return res.status(200).json({token:token})
})

const getAvatar = asyncHandler(async (req: Request, res: Response) => {
    const avatar = await prisma.avatar.findMany()
    return res.status(200).json({avatars:avatar})
});
const getBulkAvatar = asyncHandler(async (req: Request, res: Response) => {
    const {ids} = req.query;
    const avatar = await prisma.avatar.findMany({
        where:{
            id:{
                in:ids as string[]
            }
        }
    })
    if (!avatar){
        return res.status(400).json({message:"No avatar found"})
    }
    return res.status(200).json({avatars:avatar.map((item)=>({userId:item.id,imageUrl:item.imageUrl}))})
});
const postMetadata = asyncHandler(async (req: Request, res: Response) => {
        const {avatarId} = req.body;

        const updateAvatar= await prisma.user.update({
            where:{
                id:req.user.id
            },
            data:{
                avatarId
            }
        })
        if(updateAvatar){
            return res.status(200).json({message:"Avatar updated"})
        }
        return res.status(400).json({message:"Avatar not updated"})

    })
export {postSignup,postSignin,postMetadata,getAvatar,getBulkAvatar}

