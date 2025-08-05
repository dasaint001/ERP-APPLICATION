import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRole } from '../entity/User';
import { ResponseService } from '../services/ResponseService';
import { UserRepository } from '../repository/UserRepository';

export class AuthController {
        static async createFirstAdmin(req: Request, res: Response): Promise<Response> {
        try {
            const existingUsersCount = await UserRepository.count();
            if (existingUsersCount > 0) {
                return ResponseService.error(res, 'First admin already created. Use /register endpoint for new users.', null, 409);
            }

            const { email, password, firstName, lastName } = req.body;

            if (!email || !password || !firstName || !lastName) {
                return ResponseService.error(res, 'Missing required fields: email, password, firstName, lastName.', null, 400);
            }

            // Register the first user as ADMIN
            const user = await AuthService.register({ email, password, firstName, lastName, role: UserRole.ADMIN });

            const { password: _, ...userWithoutPassword } = user;
            return ResponseService.success(res, 'First admin user registered successfully.', { user: userWithoutPassword }, 201);

        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                return ResponseService.error(res, 'Email already registered.', null, 409);
            }
            return ResponseService.error(res, error.message || 'Failed to create first admin.', null, 500);
        }
    }
    
    static async register(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password, firstName, lastName, role } = req.body;

            if (!email || !password || !firstName || !lastName) {
                return ResponseService.error(res, 'Missing required fields.', null, 400);
            }

            if (role && role !== UserRole.MEMBER && (!req.user || req.user.role !== UserRole.ADMIN)) {
                return ResponseService.error(res, 'Unauthorized to register users with this role.', null, 403);
            }

            const userRole = role || UserRole.MEMBER;

            const user = await AuthService.register({ email, password, firstName, lastName, role: userRole });

            const { password: _, ...userWithoutPassword } = user;
            return ResponseService.success(res, 'User registered successfully.', { user: userWithoutPassword }, 201);
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                return ResponseService.error(res, 'Email already registered.', null, 409);
            }
            return ResponseService.error(res, error.message || 'Registration failed.', null, 500);
        }
    }

    static async login(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return ResponseService.error(res, 'Email and password are required.', null, 400);
            }

            const result = await AuthService.login(email, password);
            if (!result) {
                return ResponseService.error(res, 'Invalid credentials.', null, 401);
            }
            const { user, token } = result;
            const { password: _, ...userWithoutPassword } = user;
            return ResponseService.success(res, 'Login successful.', { user: userWithoutPassword, token });
        } catch (error: any) {
            return ResponseService.error(res, error.message || 'Login failed.', null, 500);
        }
    }

    static async getMe(req: Request, res: Response): Promise<Response> {
        if (!req.user) {
            return ResponseService.error(res, 'Not authenticated.', null, 401);
        }
        const { password: _, ...userWithoutPassword } = req.user;
        return ResponseService.success(res, 'User profile retrieved.', { user: userWithoutPassword });
    }
}