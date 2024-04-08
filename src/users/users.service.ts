import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private db: DbService) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<User | { warningMessage: string }> {
    const existingByUserName = await this.db.user.findFirst({
      where: { username: createUserDto.username },
    });

    if (existingByUserName) {
      return { warningMessage: 'Пользователь с таким именем уже существует' };
    }

    const existingByEmail = await this.db.user.findFirst({
      where: { email: createUserDto.email },
    });

    if (existingByEmail) {
      return { warningMessage: 'Пользователь с таким email уже существует' };
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.db.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        email: createUserDto.email,
      },
    });
  }
}
