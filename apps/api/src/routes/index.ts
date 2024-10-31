import { Router } from "express";
import { getAvatar, getBulkAvatar, postMetadata, postSignin, postSignup } from "../controllers/index.controller";
import adminRouter from "./admin.route";



const router:ReturnType<typeof Router>= Router();

router.post("/signup", postSignup);
router.post("/signin", postSignin);
router.post("/user/metadata",postMetadata
);
router.get("/user/metadata/bulk",getBulkAvatar);
router.get("/avatar", getAvatar);
router.use("/space",spaceRouter)
router.use("/admin",adminRouter)


export default router;

