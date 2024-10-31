import { z } from "zod";

export const createElementSchema=z.object({
    imageUrl:z.string().url(),
    width:z.number(),
    height:z.number(),
    staticc:z.boolean()
})

export const updateElementSchema=z.object({
    imageUrl:z.string().url(),
    id:z.string()
})
