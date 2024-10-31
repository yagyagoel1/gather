import jwt, { JwtPayload } from 'jsonwebtoken';



export const verifyToken = async (token: string): Promise<JwtPayload | null> => {
    try {
        const data = await jwt.verify(token, process
        .env.JWT_SECRET||"") as JwtPayload;
        return data;
    } catch (error) {
        console.error("error in verifyToken", error);
        return null;
        
    }
}