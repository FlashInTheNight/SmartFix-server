import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { DbModule } from 'src/db/db.module';
import { DbService } from 'src/db/db.service';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';

const mockedUser = {
  username: 'Jhon',
  email: 'jhon@gmail.com',
  password: 'jhon123',
};

describe('Auth Service', () => {
  let app: INestApplication;
  let authService: AuthService;
  let prisma: DbService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, DbModule],
    }).compile();

    authService = testModule.get<AuthService>(AuthService);
    prisma = testModule.get<DbService>(DbService);

    app = testModule.createNestApplication();

    await app.init();
  });

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(mockedUser.password, 10);

    const createdUser = (await prisma.user.create({
      data: {
        username: mockedUser.username,
        password: hashedPassword,
        email: mockedUser.email,
      },
    })) as User;

    expect(createdUser).toBeDefined();
    return createdUser;
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { username: mockedUser.username } });
  });

  it('should login user', async () => {
    const user = await authService.validateUser(
      mockedUser.username,
      mockedUser.password,
    );

    expect(user.username).toBe(mockedUser.username);
    expect(user.email).toBe(mockedUser.email);
  });
});
