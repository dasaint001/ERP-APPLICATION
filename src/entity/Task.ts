import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export enum TaskStatus {
    PENDING = "Pending",
    ONGOING = "Ongoing",
    IN_REVIEW = "In review",
    COMPLETED = "Completed",
}

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({
        type: "enum",
        enum: TaskStatus,
        default: TaskStatus.PENDING,
    })
    status!: TaskStatus;

    @Column({ type: "date", nullable: true })
    dueDate!: Date | null;

    @ManyToOne(() => User, user => user.assignedTasks)
    @JoinColumn({ name: 'assignedToId' })
    assignedTo!: User;

    @Column()
    assignedToId!: number;

    @ManyToOne(() => User, user => user.createdTasks)
    @JoinColumn({ name: 'createdById' })
    createdBy!: User;

    @Column()
    createdById!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}