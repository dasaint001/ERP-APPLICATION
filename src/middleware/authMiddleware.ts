import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { ResponseService } from '../services/ResponseService';

interface DecodedToken {
    id: number;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ResponseService.error(res, 'No token provided or invalid token format.', null, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'taskerpsecretjwtkey') as DecodedToken;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ id: decoded.id });

        if (!user) {
            return ResponseService.error(res, 'User not found.', null, 401);
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return ResponseService.error(res, 'Invalid or expired token.', null, 403);
    }
};