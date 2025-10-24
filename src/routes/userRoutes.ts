import { createUserController, fetchUserController, updateUserController, fetchUserByIdController, deactivateUserController, activateUserController, generateSecretController } from "@controller/userController";
import { authenticateToken } from "@middleware/auth";
import { validateRequest } from "@middleware/validateRequest";
import { createUserSchema, updateUserSchema } from "@schemas/userSchema";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/user", authenticateToken, fetchUserController);
userRouter.post("/user", authenticateToken, validateRequest(createUserSchema), createUserController);
userRouter.put("/user/:id", authenticateToken, validateRequest(updateUserSchema), updateUserController);
userRouter.get("/user/:id", authenticateToken, fetchUserByIdController);
userRouter.delete("/user/:id", authenticateToken, deactivateUserController);
userRouter.put("/user-active/:id", authenticateToken, activateUserController);

userRouter.put("/generate-secret/:id", generateSecretController);

export default userRouter;