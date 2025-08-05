import { AppDataSource } from "../data-source";
import { ActionLog } from "../entity/ActionLog";

export const ActionLogRepository = AppDataSource.getRepository(ActionLog).extend({
    
});