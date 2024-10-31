import { Router } from "express";
import { addElementToSpace, createSpace, deleteElementFromSpace, deleteSpace,getMySpaces, getSpaceById, getSpaceElement } from "../controllers/space.controller";
import { authMiddleware } from "../middlewares/auth.middleware";






const router: ReturnType<typeof Router> = Router();

router.post("/",authMiddleware(["admin","user"]),createSpace)
router.delete("/:id",authMiddleware(["admin","user"]),deleteSpace)
router.get("/all",authMiddleware(["admin","user"]),getMySpaces)
router.get("/:id",authMiddleware(["admin","user"]),getSpaceById)
router.post("/element",authMiddleware(["admin","user"]),addElementToSpace)
router.delete("/element/:id",authMiddleware(["admin","user"]),deleteElementFromSpace)
router.get("/elements",authMiddleware(["admin","user"]),getSpaceElement)

export default router;
