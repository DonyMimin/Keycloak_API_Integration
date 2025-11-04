import { Request, Response, NextFunction } from 'express';
import { fetchUser, createUser, updateUser, fetchUserById, deactivateUser, activateUser, generateClientSecret } from '@services/userServices';
import { successResponse } from '@helpers/responseFormatter';
import { AuthenticatedRequest } from '@middleware/auth';

export const fetchUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const size = parseInt(req.query.size as string) || 10;
        const search = (req.query.search as string) || '';
        const sort = (req.query.sort as any) || { createdTimestamp: 'asc' };
        const order = (req.query.order as string) === 'desc' ? 'desc' : 'asc';
        const status = req.query.status ?? "";

        const userList = await fetchUser({ page, size, search, sort, order }, status);

        res.status(200).json(
            successResponse({
                message: 'User fetched successfully',
                data: userList,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const fetchUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const userList = await fetchUserById(id);

        res.status(200).json(
            successResponse({
                message: 'User fetched successfully',
                data: userList,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as AuthenticatedRequest;

        const createdUser = await createUser(req.body, user?.name as string);

        res.status(200).json(
            successResponse({
                message: 'User created successfully',
                data: createdUser,
            })
        );

    } catch (error) {
        next(error);
    }
};

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as AuthenticatedRequest;

        const { id } = req.params;

        const updatedUser = await updateUser(id, req.body, user?.name as string);

        res.status(200).json(
            successResponse({
                message: 'User updated successfully',
                data: updatedUser,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const deactivateUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as AuthenticatedRequest;

        const { id } = req.params;

        const deactivateUserData = await deactivateUser(id, user?.name as string);

        res.status(200).json(
            successResponse({
                message: 'User deleted successfully',
                data: deactivateUserData,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const activateUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as AuthenticatedRequest;

        const { id } = req.params;

        const activateUserData = await activateUser(id, user?.name as string);

        res.status(200).json(
            successResponse({
                message: 'User activated successfully',
                data: activateUserData,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const generateSecretController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const secret = await generateClientSecret(id);

    return res.status(200).json(
      successResponse({
        message: "Secret generated successfully",
        data: secret,
      })
    );
  } catch (error) {
    console.error("Error generating secret:", error);
    next(error);
  }
};
