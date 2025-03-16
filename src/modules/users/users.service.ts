import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/shared/database/database.service";

@Injectable()
export class UsersService {
    constructor(private readonly databaseService: DatabaseService) { }

    async findByEmail(email: string) {
        return this.databaseService.user.findFirst({ where: { email } });
    }

    async createUser(email: string, password: string) {
        return this.databaseService.user.create({ data: { email, password } });
    }

    async findOne(id: string) {
        return this.databaseService.user.findUnique({ where: { id } });
    }
}
