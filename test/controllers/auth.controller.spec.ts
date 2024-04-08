import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DbService } from 'src/db/db.service';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import * as session from 'express-session';
import * as passport from 'passport';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

const mockedUser = {
  username: 'Boris',
  email: 'boris@gmail.com',
  password: 'boris123',
};

describe('Auth Controller', () => {
  let app: INestApplication;
  let prisma: DbService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, UsersModule],
    }).compile();

    app = testModule.createNestApplication();
    app.use(
      session({
        secret: 'keyword',
        resave: false,
        saveUninitialized: false,
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<DbService>(DbService);
  });

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(mockedUser.password, 10);

    const createdUser = await prisma.user.create({
      data: {
        username: mockedUser.username,
        password: hashedPassword,
        email: mockedUser.email,
      },
    });

    expect(createdUser).toBeDefined();
    return createdUser;
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { username: mockedUser.username } });
  });

  it('should be in database', async () => {
    const user = await prisma.user.findFirst({
      where: { username: mockedUser.username },
    });

    expect(user.username).toBe(mockedUser.username);
  });

  it('should login user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    expect(response.body.msg).toBe('Logged in');
    expect(response.body.user.username).toBe(mockedUser.username);
    expect(response.body.user.email).toBe(mockedUser.email);
  });

  it('should login check', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const loginCheck = await request(app.getHttpServer())
      .get('/users/login-check')
      .set('Cookie', login.headers['set-cookie']);

    expect(loginCheck.body.username).toBe(mockedUser.username);
    expect(loginCheck.body.email).toBe(mockedUser.email);
  });

  it('should logout', async () => {
    const response = await request(app.getHttpServer()).get('/users/logout');

    expect(response.body.msg).toBe('session has ended');
  });
});
