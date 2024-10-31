import jwt from 'jsonwebtoken';

export const createToken = async (data: {id:string}) => {
    const token =  jwt.sign(data, process.env.JWT_SECRET||"",{expiresIn: '365d'});
    return token;
}

export const verifyToken = async (token: string) => {
    try {
        const data = jwt.verify(token, process
        .env.JWT_SECRET||"");
        return data;
    } catch (error) {
        console.error("error in verifyToken", error);
        return null;
        
    }
}