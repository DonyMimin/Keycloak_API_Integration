import { Request, Response, NextFunction } from 'express';
import { createRole, updateRole, fetchRole, fetchRoleById, fetchRoleList } from '@services/roleServices';
import { successResponse } from '@helpers/responseFormatter';
import { AuthenticatedRequest } from '@middleware/auth';

export const fetchRoleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const size = parseInt(req.query.size as string) || 10;
        const search = (req.query.search as string) || '';
        const sort = (req.query.sort as any) || { mr_created_date: 'desc' };
        const order = (req.query.order as string) === 'desc' ? 'desc' : 'asc';

        const roleList = await fetchRole({ page, size, search, sort, order });

        res.status(200).json(
            successResponse({
                message: 'Role fetched successfully',
                data: roleList,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const fetchRoleByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const roleList = await fetchRoleById(id);

        res.status(200).json(
            successResponse({
                message: 'Role fetched successfully',
                data: roleList,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const fetchRoleListController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roleList = await fetchRoleList();

        res.status(200).json(
            successResponse({
                message: 'Role fetched successfully',
                data: roleList,
            })
        );
    } catch (error) {
        next(error);
    }
};


export const createRoleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as AuthenticatedRequest;

        const createdRole = await createRole(req.body, user?.name as string);

        res.status(200).json(
            successResponse({
                message: 'Role created successfully',
                data: createdRole,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const updateRoleController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = req as AuthenticatedRequest;

        const { id } = req.params;

        const updatedRole = await updateRole(id, req.body, user?.name as string);

        res.status(200).json(
            successResponse({
                message: 'Role updated successfully',
                data: updatedRole,
            })
        );
    } catch (error) {
        next(error);
    }
};