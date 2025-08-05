import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export const UserRepository = AppDataSource.getRepository(User).extend({
    findByEmail(email: string) {
        return this.findOne({ where: { email } });
    },
});