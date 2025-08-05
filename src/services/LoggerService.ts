import { ActionLog } from "../entity/ActionLog";
import { ActionLogRepository } from "../repository/ActionLogRepository";

export class LoggerService {
    static async logAction(userId: number, actionType: string, details: object | null = null): Promise<ActionLog> {
        const logEntry = ActionLogRepository.create({
            userId,
            actionType,
            details,
        });
        return ActionLogRepository.save(logEntry);
    }

    static async getLogs(): Promise<ActionLog[]> {
        return ActionLogRepository.find({ relations: ['user'] });
    }
}