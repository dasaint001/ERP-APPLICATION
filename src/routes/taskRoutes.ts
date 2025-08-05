import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { UserRole } from '../entity/User';

const router = Router();

router.use(authMiddleware);

// CRUD Endpoints for Tasks
router.post('/', authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER]), TaskController.createTask); // Members can create tasks assigned to themselves
router.get('/', TaskController.getTasks); // All authenticated users can view tasks
router.get('/:id', TaskController.getTaskById); // All authenticated users can view tasks (with internal authorization for members)

// Assign tasks (Admin/Manager only)
router.patch('/:id/assign', authorize([UserRole.ADMIN, UserRole.MANAGER]), TaskController.assignTask);

// Update task status (Admin/Manager, or assigned Member with specific transitions)
router.patch('/:id/status', authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER]), TaskController.updateTaskStatus);

// Update task details (Admin/Manager, or assigned Member for certain fields)
router.put('/:id', authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER]), TaskController.updateTask);

// Delete tasks (Admin/Manager only)
router.delete('/:id', authorize([UserRole.ADMIN, UserRole.MANAGER]), TaskController.deleteTask);

export default router;