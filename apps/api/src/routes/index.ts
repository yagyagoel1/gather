import { Router } from "express";
import { getAvatar, getBulkAvatar, postMetadata, postSignin, postSignup } from "../controllers/index.controller";
import adminRouter from "./admin.route";
import spaceRouter from "./space.route";


const router:ReturnType<typeof Router>= Router();

router.post("/signup", postSignup);
router.post("/signin", postSignin);
router.post("/user/metadata",authMiddleware(["admin","user"]),postMetadata
);
router.get("/user/metadata/bulk",authMiddleware(["admin","user"]),getBulkAvatar);
router.get("/avatar", authMiddleware(["admin","user"]), getAvatar);
router.use("/space", authMiddleware(["admin","user"]),spaceRouter)
router.use("/admin",authMiddleware(["admin","user"]),adminRouter)


export default router;

