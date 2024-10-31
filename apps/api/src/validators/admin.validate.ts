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

export const createAvatarSchema=z.object({
    imageUrl:z.string().url(),
    name:z.string()
})

export const createMapSchema=z.object({ 
    thumbnail:z.string().url(),
    name:z.string(),
    dimensions:z.string(),
    defaultElements:z.array(z.object({
        elementId:z.string(),
        x:z.number(),
        y:z.number()
    }))

})
