import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import * as session from 'express-session';
import * as passport from 'passport';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DbModule } from 'src/db/db.module';
import { PaymentModule } from 'src/payment/payment.module';
import { AuthModule } from 'src/auth/auth.module';
import { DbService } from 'src/db/db.service';
import { UsersModule } from 'src/users/users.module';

const mockedUser = {
  username: 'Boris',
  email: 'boris@gmail.com',
  password: 'boris123',
};

const mockedPay = {
  status: 'pending',
  amount: {
    value: '100.00',
    currency: 'RUB',
  },
};

describe('Payment Controller', () => {
  let app: INestApplication;
  let prisma: DbService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [DbModule, PaymentModule, AuthModule, UsersModule],
    }).compile();

    prisma = testModule.get<DbService>(DbService);
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

    await app.init();
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

  it('should make payment', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const response = await request(app.getHttpServer())
      .post('/payment')
      .send({ amount: 100 })
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body.status).toEqual(mockedPay.status);
    expect(response.body.amount).toEqual(mockedPay.amount);
  });
});
