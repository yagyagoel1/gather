import { Router } from "express";
import postSignup from "../controllers/index.controller";




const router:ReturnType<typeof Router>= Router();

router.post("/signup", postSignup);
router.post("/signin", postSignin);



export default router;

