import { Router } from "express"
import { createAvatar, createElement,  createMap, updateElement } from "../controllers/admin.controller"

import { authMiddleware } from "../middlewares/auth.middleware"


const router: ReturnType<typeof Router> = Router()

router.post("/element",authMiddleware(["admin"]),createElement)
router.put("/element/:id",authMiddleware(["admin"]),updateElement)
router.post("/avatar",authMiddleware(["admin"]),createAvatar)
router.post("/map",authMiddleware(["admin"]),createMap)
export default router