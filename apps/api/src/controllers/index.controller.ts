import type { Request, Response } from "express";
import prisma  from "@repo/db"
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
            role:type
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


export {postSignup,postSignin}

