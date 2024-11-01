import { Router } from "express";
import { getAvatar, getBulkAvatar, postMetadata, postSignin, postSignup } from "../controllers/index.controller";
import adminRouter from "./admin.route";
import spaceRouter from "./space.route";
import { authMiddleware } from "../middlewares/auth.middleware";


const router:ReturnType<typeof Router>= Router();

router.post("/signup", postSignup);
router.post("/signin", postSignin);
router.post("/user/metadata",authMiddleware(["admin","user"]),postMetadata
);
router.get("/user/metadata/bulk",authMiddleware(["admin","user"]),getBulkAvatar);
router.get("/avatar", authMiddleware(["admin","user"]), getAvatar);
router.use("/space",spaceRouter)
router.use("/admin",adminRouter)


export default router;

