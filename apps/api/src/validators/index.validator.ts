import {z} from "zod"



export const signupSchema = z.object({
    username: z.string().min(3).max(255),
    password: z.string().min(6).max(255),
    type: z.enum(["admin","user"])
})

export const loginSchema = z.object({
    username: z.string().min(3).max(255),
    password: z.string().min(6).max(255),
})