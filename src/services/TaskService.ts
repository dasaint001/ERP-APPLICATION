import { Task, TaskStatus } from "../entity/Task";
import { User, UserRole } from "../entity/User";
import { TaskRepository } from "../repository/TaskRepository";
import { LoggerService } from "./LoggerService";
import { UserRepository } from "../repository/UserRepository";

export class TaskService {
    static async createTask(taskData: Partial<Task>, createdBy: User): Promise<Task> {
        const assignedToUser = await UserRepository.findOneBy({ id: taskData.assignedToId });
        if (!assignedToUser) {
            throw new Error('Assigned user not found.');
        }

        const newTask = TaskRepository.create({
            ...taskData,
            createdBy: createdBy,
            assignedTo: assignedToUser,
            status: TaskStatus.PENDING,
        });
        await TaskRepository.save(newTask);
        await LoggerService.logAction(createdBy.id, 'TASK_CREATED', { taskId: newTask.id, title: newTask.title, assignedTo: assignedToUser.email });
        return newTask;
    }

    static async getTasks(user: User): Promise<Task[]> {
        if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
            return TaskRepository.find({ relations: ['assignedTo', 'createdBy'] });
        }
        return TaskRepository.find({ where: { assignedTo: { id: user.id } }, relations: ['assignedTo', 'createdBy'] });
    }

    static async getTaskById(taskId: number, user: User): Promise<Task | null> {
        const task = await TaskRepository.findOne({ where: { id: taskId }, relations: ['assignedTo', 'createdBy'] });
        if (!task) {
            return null;
        }
        if (user.role === UserRole.MEMBER && task.assignedTo.id !== user.id) {
            return null;
        }
        return task;
    }

    static async updateTask(taskId: number, taskData: Partial<Task>, requestingUser: User): Promise<Task | null> {
        const task = await TaskRepository.findOneBy({ id: taskId });
        if (!task) {
            return null;
        }

        if (requestingUser.role === UserRole.MEMBER && task.assignedToId !== requestingUser.id) {
            throw new Error('Unauthorized to update this task.');
        }

        if (taskData.status && taskData.status !== task.status) {
            const oldStatus = task.status;
            const newStatus = taskData.status;

            if (requestingUser.role === UserRole.MEMBER) {
                if (oldStatus === TaskStatus.PENDING && newStatus === TaskStatus.ONGOING) {
                } else if (oldStatus === TaskStatus.ONGOING && newStatus === TaskStatus.IN_REVIEW) {
                } else {
                    throw new Error(`Invalid status transition from ${oldStatus} to ${newStatus} for a MEMBER.`);
                }
            }
            // ADMIN/MANAGER can transition freely (or define specific rules for them)
            // For 'Completed' status, specific conditions apply
            if (newStatus === TaskStatus.COMPLETED) {
                if (requestingUser.role === UserRole.MEMBER && task.assignedToId !== requestingUser.id) {
                     throw new Error('Only Admin or the assigned member can mark task as Completed.');
                }
                if (requestingUser.role === UserRole.MEMBER && task.assignedToId === requestingUser.id) {
                } else if (requestingUser.role !== UserRole.ADMIN && requestingUser.role !== UserRole.MANAGER) {
                    throw new Error('Only Admin or Manager can mark other tasks as Completed.');
                }
            }
        }

        Object.assign(task, taskData);
        await TaskRepository.save(task);
        await LoggerService.logAction(requestingUser.id, 'TASK_UPDATED', { taskId: task.id, updates: taskData });
        return task;
    }

    static async assignTask(taskId: number, assignedToId: number, requestingUser: User): Promise<Task | null> {
        const task = await TaskRepository.findOneBy({ id: taskId });
        if (!task) {
            return null;
        }

        const assignedToUser = await UserRepository.findOneBy({ id: assignedToId });
        if (!assignedToUser) {
            throw new Error('User to assign task to not found.');
        }

        if (requestingUser.role !== UserRole.ADMIN && requestingUser.role !== UserRole.MANAGER) {
            throw new Error('Unauthorized to assign tasks.');
        }

        task.assignedTo = assignedToUser;
        task.assignedToId = assignedToUser.id; // Update the foreign key column
        await TaskRepository.save(task);
        await LoggerService.logAction(requestingUser.id, 'TASK_ASSIGNED', { taskId: task.id, assignedTo: assignedToUser.email });
        return task;
    }

    static async deleteTask(taskId: number, requestingUser: User): Promise<boolean> {
        if (requestingUser.role !== UserRole.ADMIN && requestingUser.role !== UserRole.MANAGER) {
            throw new Error('Unauthorized to delete tasks.');
        }

        const task = await TaskRepository.findOneBy({ id: taskId });
        if (!task) {
            return false;
        }

        await TaskRepository.remove(task);
        await LoggerService.logAction(requestingUser.id, 'TASK_DELETED', { taskId: taskId, title: task.title });
        return true;
    }
}