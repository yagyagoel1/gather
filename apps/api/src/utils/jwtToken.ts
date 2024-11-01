import jwt, { JwtPayload } from 'jsonwebtoken';

export const createToken = async (data: {id:string}) => {
    const token =  await jwt.sign(data, process.env.JWT_SECRET||"sfdsfsdfsf",{expiresIn: '365d'});
    return token;
}

export const verifyToken = async (token: string): Promise<JwtPayload | null> => {
    try {
        const data = await jwt.verify(token, process
        .env.JWT_SECRET||"sfdsfsdfsf") as JwtPayload;
        return data;
    } catch (error) {
        console.error("error in verifyToken", error);
        return null;
        
    }
}