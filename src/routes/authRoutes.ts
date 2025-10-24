import { authenticateToken } from "@middleware/auth";
import { Router } from "express";
import { validateRequest } from "@middleware/validateRequest";
import { changePasswordSchema, loginSchema } from "@schemas/authSchema";
import { loginController, refreshTokenController, changePasswordController } from "@controller/authController";

const authRouter = Router();

authRouter.post("/auth/login", validateRequest(loginSchema), loginController);
authRouter.post("/auth/refresh", authenticateToken, refreshTokenController);
authRouter.put("/auth/change-password", authenticateToken, validateRequest(changePasswordSchema), changePasswordController);

export default authRouter;