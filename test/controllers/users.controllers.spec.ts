import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from 'src/users/users.module';
import { DbService } from 'src/db/db.service';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

describe('Users Controller', () => {
  let app: INestApplication;
  let prisma: DbService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

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

    const response = await request(app.getHttpServer())
      .post('/users/signup')
      .send(newUser);

    const passwordIsValid = await bcrypt.compare(
      newUser.password,
      response.body.password,
    );

    expect(response.body.username).toBe(newUser.username);
    expect(passwordIsValid).toBe(true);
    expect(response.body.email).toBe(newUser.email);
  });
});
