import "reflect-metadata"; // Required for TypeORM
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { logger } from './middleware/loggerMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        // Middleware
        app.use(express.json());
        app.use(logger);

        // Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/tasks', taskRoutes);

        app.use(errorMiddleware);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error: any) => console.error("Error during Data Source initialization:", error));
