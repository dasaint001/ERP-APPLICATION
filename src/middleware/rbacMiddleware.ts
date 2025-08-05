import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entity/User';
import { ResponseService } from '../services/ResponseService';

export const authorize = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return ResponseService.error(res, 'Authentication required.', null, 401);
        }

        if (!roles.includes(req.user.role)) {
            return ResponseService.error(res, 'Forbidden: You do not have the necessary permissions.', null, 403);
        }
        next();
    };
};