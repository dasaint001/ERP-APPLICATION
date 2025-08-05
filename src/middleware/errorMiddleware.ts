import { Request, Response, NextFunction } from 'express';
import { ResponseService } from '../services/ResponseService';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    let statusCode = 500;
    let message = 'An unexpected error occurred.';
    let errors = {};

    if (err instanceof Error) {
        message = err.message;
        if (message.includes('Unauthorized')) {
            statusCode = 403;
        } else if (message.includes('not found')) {
            statusCode = 404;
        } else if (message.includes('Invalid')) {
            statusCode = 400;
        }
    }

    ResponseService.error(res, message, errors, statusCode);
};