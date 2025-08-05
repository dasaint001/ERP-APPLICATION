import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class ActionLog {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.actionLogs)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column()
    userId!: number;

    @Column()
    actionType!: string;

    @Column({ type: "json", nullable: true })
    details!: object | null;

    @CreateDateColumn()
    timestamp!: Date;
}
