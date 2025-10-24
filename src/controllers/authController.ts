import { successResponse } from '@helpers/responseFormatter';
import { AuthenticatedRequest } from '@middleware/auth';
import { login, refreshToken, changePassword } from '@services/authServices';
import { Request, Response, NextFunction } from 'express';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const loginData = await login(req.body);

        res.status(200).json(
            successResponse({
                message: 'Login Successful',
                data: loginData,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshTokenData = await refreshToken(req.body);

        res.status(200).json(
            successResponse({
                message: 'Refresh Token Successful',
                data: refreshTokenData,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const changePasswordController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { user } = req as AuthenticatedRequest;
        const { new_password, confirm_password } = req.body;

        const changePasswordData = await changePassword(user?.id, new_password, confirm_password);

        res.status(200).json(
            successResponse({
                message: 'Change Password Successful',
                data: changePasswordData,
            })
        );
    } catch (error) {
        next(error);
    }
};
