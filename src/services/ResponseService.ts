import { Response } from 'express';

export class ResponseService {
    /**
     * Sends a successful JSON response.
     * @param res The Express response object.
     * @param message A descriptive success message.
     * @param data The data payload to include in the response.
     * @param statusCode The HTTP status code (default: 200).
     */
    static success(res: Response, message: string, data: any = null, statusCode: number = 200): Response {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    /**
     * Sends an error JSON response.
     * @param res The Express response object.
     * @param message A descriptive error message.
     * @param errors Optional additional error details (e.g., validation errors).
     * @param statusCode The HTTP status code (default: 400).
     */
    static error(res: Response, message: string, errors: any = null, statusCode: number = 400): Response {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
        });
    }
}