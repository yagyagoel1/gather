import { Router } from "express"
import { createAvatar, createElement,  createMap, updateElement } from "../controllers/admin.controller"





const router: ReturnType<typeof Router> = Router()

router.post("/element",createElement)
router.put("/element/:id",updateElement)
router.post("/avatar",createAvatar)
router.post("/map",createMap)
export default router