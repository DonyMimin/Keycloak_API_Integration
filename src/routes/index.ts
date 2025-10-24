import { Request, Response, Router } from "express";
import authRouter from "./authRoutes";
import userRouter from "./userRoutes";
import roleRouter from "./roleRoutes";

const router = Router();

router.post("/test-logger", (req: Request, res: Response) => {
	console.log(req.body);
	res.send("Hello, world!");
});

router.use(authRouter);
router.use(userRouter);
router.use(roleRouter);

export default router;