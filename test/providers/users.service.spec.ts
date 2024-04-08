import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { DbModule } from 'src/db/db.module';
import { DbService } from 'src/db/db.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

describe('Users service', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let prisma: DbService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    usersService = testModule.get<UsersService>(UsersService);
    app = testModule.createNestApplication();
    await app.init();

    prisma = app.get<DbService>(DbService);
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { username: 'Test' } });
  });

  it('should create user', async () => {
    const newUser = {
      username: 'Test',
      email: 'test@gmail.com',
      password: 'test123',
    };

    const user = (await usersService.create(newUser)) as User;

    const passwordIsValid = await bcrypt.compare(
      newUser.password,
      user.password,
    );

    expect(user.username).toBe(newUser.username);
    expect(passwordIsValid).toBe(true);
    expect(user.email).toBe(newUser.email);
  });
});
