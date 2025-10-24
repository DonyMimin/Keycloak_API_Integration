import { createRoleController, fetchRoleByIdController, fetchRoleController, updateRoleController, fetchRoleListController } from "@controller/roleController";
import { authenticateToken } from "@middleware/auth";
import { Router } from "express";
import { validateRequest } from "@middleware/validateRequest";
import { createRoleSchema, updateRoleSchema } from "@schemas/roleSchema";

const roleRouter = Router();

roleRouter.get("/role", authenticateToken, fetchRoleController);
roleRouter.post("/role", authenticateToken, validateRequest(createRoleSchema), createRoleController);
roleRouter.put("/role/:id", authenticateToken, validateRequest(updateRoleSchema), updateRoleController);
roleRouter.get("/role/list", authenticateToken, fetchRoleListController);
roleRouter.get("/role/:id", authenticateToken, fetchRoleByIdController);



export default roleRouter;