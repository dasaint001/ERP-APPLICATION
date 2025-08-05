import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Task } from "./Task";
import { ActionLog } from "./ActionLog";

export enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    MEMBER = "MEMBER",
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.MEMBER,
    })
    role!: UserRole;

    @OneToMany(() => Task, task => task.assignedTo)
    assignedTasks!: Task[];

    @OneToMany(() => Task, task => task.createdBy)
    createdTasks!: Task[];

    @OneToMany(() => ActionLog, actionLog => actionLog.user)
    actionLogs!: ActionLog[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}