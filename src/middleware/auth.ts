import { keycloakVerifyToken } from "@helpers/keycloak";
import { fetchUserInfoKeycloak } from "@models/keycloak/user_keycloak";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email?: string;
    name?: string;
    roles?: string[];
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        data: null,
        error: "Authorization token is required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Call Keycloak to verify the token
    const data = await keycloakVerifyToken(token);
    if (!data.active) {
      res.status(401).json({
        data: null,
        error: "Invalid or expired token",
      });
      return;
    }

    // Get user info from Keycloak
    const userInfo = await fetchUserInfoKeycloak(token);

    req.user = {
      id: userInfo.sub,
      username: userInfo.preferred_username,
      email: userInfo.email,
      name: userInfo.name,
      roles: data.realm_access?.roles || [],
    };

    next();
  } catch (error: any) {
    console.error("Keycloak authentication error:", error.response?.data || error.message);

    res.status(401).json({
      data: null,
      error: "Authentication failed",
    });
  }
};
