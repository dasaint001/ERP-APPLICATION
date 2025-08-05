import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/LoggerService';

export const logger = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        const actionType = `HTTP_REQUEST_${req.method}`;
        const details = {
            path: req.path,
            body: req.body,
            params: req.params,
            query: req.query,
        };
        await LoggerService.logAction(req.user.id, actionType, details);
    }
    next();
};