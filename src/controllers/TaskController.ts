import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { Task, TaskStatus } from '../entity/Task';
import { UserRole } from '../entity/User';

import { ResponseService } from '../services/ResponseService';

export class TaskController {
    static async createTask(req: Request, res: Response): Promise<Response> {
        try {
            const { title, description, assignedToId, dueDate } = req.body;
            if (!title || !assignedToId) {
                return ResponseService.error(res, 'Title and assignedToId are required.', null, 400);
            }

            if (isNaN(Number(assignedToId))) {
                return ResponseService.error(res, 'assignedToId must be a number.', null, 400);
            }

            if (req.user!.role === UserRole.MEMBER && req.user!.id !== assignedToId) {
                return ResponseService.error(res, 'Members can only create tasks assigned to themselves.', null, 403);
            }

            const task = await TaskService.createTask(
                {
                    title,
                    description,
                    assignedToId: Number(assignedToId),
                    dueDate: dueDate ? new Date(dueDate) : null,
                },
                req.user!
            );
            return ResponseService.success(res, 'Task created successfully.', { task }, 201);
        } catch (error: any) {
            return ResponseService.error(res, error.message || 'Failed to create task.', null, 500);
        }
    }

    static async getTasks(req: Request, res: Response): Promise<Response> {
        try {
            const tasks = await TaskService.getTasks(req.user!);
            return ResponseService.success(res, 'Tasks retrieved successfully.', { tasks });
        }
        catch (error: any) {
            return ResponseService.error(res, error.message || 'Failed to retrieve tasks.', null, 500);
        }
    }

    static async getTaskById(req: Request, res: Response): Promise<Response> {
        try {
            const taskId = parseInt(req.params.id, 10);
            if (isNaN(taskId)) {
                return ResponseService.error(res, 'Invalid task ID.', null, 400);
            }

            const task = await TaskService.getTaskById(taskId, req.user!);
            if (!task) {
                return ResponseService.error(res, 'Task not found or unauthorized.', null, 404);
            }
            return ResponseService.success(res, 'Task retrieved successfully.', { task });
        } catch (error: any) {
            return ResponseService.error(res, error.message || 'Failed to retrieve task.', null, 500);
        }
    }

    static async updateTask(req: Request, res: Response): Promise<Response> {
        try {
            const taskId = parseInt(req.params.id, 10);
            if (isNaN(taskId)) {
                return ResponseService.error(res, 'Invalid task ID.', null, 400);
            }

            const { title, description, dueDate, status } = req.body;
            const updates: Partial<Task> = { title, description, dueDate, status };

            const updatedTask = await TaskService.updateTask(taskId, updates, req.user!);
            if (!updatedTask) {
                return ResponseService.error(res, 'Task not found or unauthorized to update.', null, 404);
            }
            return ResponseService.success(res, 'Task updated successfully.', { task: updatedTask });
        } catch (error: any) {
            const statusCode = error.message.includes('Unauthorized') || error.message.includes('Invalid status transition') ? 403 : 500;
            return ResponseService.error(res, error.message || 'Failed to update task.', null, statusCode);
        }
    }

    static async assignTask(req: Request, res: Response): Promise<Response> {
        try {
            const taskId = parseInt(req.params.id, 10);
            const { assignedToId } = req.body;

            if (isNaN(taskId) || isNaN(Number(assignedToId))) {
                return ResponseService.error(res, 'Invalid task ID or assignedToId.', null, 400);
            }

            const updatedTask = await TaskService.assignTask(taskId, Number(assignedToId), req.user!);
            if (!updatedTask) {
                return ResponseService.error(res, 'Task or assigned user not found.', null, 404);
            }
            return ResponseService.success(res, 'Task assigned successfully.', { task: updatedTask });
        } catch (error: any) {
            const statusCode = error.message.includes('Unauthorized') ? 403 : 500;
            return ResponseService.error(res, error.message || 'Failed to assign task.', null, statusCode);
        }
    }

    static async updateTaskStatus(req: Request, res: Response): Promise<Response> {
        try {
            const taskId = parseInt(req.params.id, 10);
            const { status } = req.body;

            if (isNaN(taskId) || !Object.values(TaskStatus).includes(status)) {
                return ResponseService.error(res, 'Invalid task ID or status.', null, 400);
            }

            const updatedTask = await TaskService.updateTask(taskId, { status }, req.user!);
            if (!updatedTask) {
                return ResponseService.error(res, 'Task not found or unauthorized to update status.', null, 404);
            }
            return ResponseService.success(res, 'Task status updated successfully.', { task: updatedTask });
        } catch (error: any) {
            const statusCode = error.message.includes('Unauthorized') || error.message.includes('Invalid status transition') ? 403 : 500;
            return ResponseService.error(res, error.message || 'Failed to update task status.', null, statusCode);
        }
    }

    static async deleteTask(req: Request, res: Response): Promise<Response> {
        try {
            const taskId = parseInt(req.params.id, 10);
            if (isNaN(taskId)) {
                return ResponseService.error(res, 'Invalid task ID.', null, 400);
            }

            const deleted = await TaskService.deleteTask(taskId, req.user!);
            if (!deleted) {
                return ResponseService.error(res, 'Task not found or unauthorized to delete.', null, 404);
            }
            return ResponseService.success(res, 'Task deleted successfully.');
        } catch (error: any) {
            const statusCode = error.message.includes('Unauthorized') ? 403 : 500;
            return ResponseService.error(res, error.message || 'Failed to delete task.', null, statusCode);
        }
    }
}