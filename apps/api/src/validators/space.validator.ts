import { z } from "zod";

export const createSpaceSchema = z.object({
    name: z.string(),
    thumbnail: z.string().url().optional(),
    mapId: z.string().optional(),

    });


export const addElementToSpaceSchema = z.object({
    spaceId: z.string(),
    elementId: z.string(),
    x: z.number(),
    y: z.number(),
    });

export const deleteElementFromSpaceSchema = z.object({
    spaceId: z.string(),
    id: z.string(),
    });
