import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtToken';
import prisma from '@repo/db';

interface User{
    id:string,
    role:string,
    username:string,
}

declare global {

    namespace Express {
    interface Request {
        user: User;
    }
}
}

export const authMiddleware = (role:string[])=>{
   

  return  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.Authorization || req.headers.authorization;
    if (!token) {
        return res.status(400).json({ message: "Unauthorized" });
    }
    if(Array.isArray(token)){
        token = token[0]
    }
    if(token.startsWith("Bearer ")){
        token = token.slice(7, token.length);
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
        return res.status(400).json({ message: "Unauthorized" });
    }
    const user = await prisma.user.findFirst({
        where:{
            id:decoded.id
        }
    })
    if (!user){
        return res.status(400).json({message:"Unauthorized"})
    }
    if (!role.includes( user.role)){
        return res.status(400).json({message:"Unauthorized"})
    }

    req.user = user;
    next();
    }
}