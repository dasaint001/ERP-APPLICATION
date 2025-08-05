import { User, UserRole } from "../entity/User";
import { UserRepository } from "../repository/UserRepository";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoggerService } from "./LoggerService";

export class AuthService {
    static async register(userData: Partial<User>): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password!, 10);
        const newUser = UserRepository.create({
            ...userData,
            password: hashedPassword,
            role: userData.role || UserRole.MEMBER
        });
        await UserRepository.save(newUser);
        await LoggerService.logAction(newUser.id, 'USER_REGISTERED', { email: newUser.email, role: newUser.role });
        return newUser;
    }

    static async login(email: string, password: string): Promise<{ user: User, token: string } | null> {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'taskerpsecretjwtkey',
            { expiresIn: '1h' }
        );

        await LoggerService.logAction(user.id, 'USER_LOGIN', { email: user.email });
        return { user, token };
    }
}