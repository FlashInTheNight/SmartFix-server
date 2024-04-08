import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { BoilerPartsModule } from 'src/boiler-parts/boiler-parts.module';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { DbModule } from 'src/db/db.module';
import { DbService } from 'src/db/db.service';
import { ShoppingCartModule } from 'src/shopping-cart/shopping-cart.module';
import { UsersModule } from 'src/users/users.module';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import * as session from 'express-session';
import * as passport from 'passport';

const mockedUser = {
  username: 'Boris',
  email: 'boris@gmail.com',
  password: 'boris123',
};

describe('Shopping Cart Controller', () => {
  let app: INestApplication;
  let prisma: DbService;
  let boilerPartsService: BoilerPartsService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        DbModule,
        ShoppingCartModule,
        AuthModule,
        UsersModule,
        BoilerPartsModule,
      ],
    }).compile();

    boilerPartsService = testModule.get<BoilerPartsService>(BoilerPartsService);
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

  beforeEach(async () => {
    const user = await prisma.user.findFirst({
      where: { username: mockedUser.username },
    });

    const part = await prisma.boilerParts.findUnique({
      where: { id: 1 },
    });

    const cart = await prisma.shoppingCart.create({
      data: {
        userId: user.id,
        partId: part.id,
        boiler_manufacturer: part.boiler_manufacturer,
        parts_manufacturer: part.parts_manufacturer,
        price: part.price,
        in_stock: part.in_stock,
        image: JSON.parse(part.images)[0],
        name: part.name,
        total_price: part.price,
      },
    });

    expect(cart).toBeDefined();
    return cart;
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { username: mockedUser.username } });
    await prisma.shoppingCart.deleteMany({ where: { partId: 1 } });
  });

  it('should get updated count of cart item', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const response = await request(app.getHttpServer())
      .patch('/shopping-cart/count/1')
      .send({ count: 2 })
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toEqual({ count: 2 });
  });

  it('should get updated total price of cart item', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const part = await boilerPartsService.findOne(1);

    const response = await request(app.getHttpServer())
      .patch('/shopping-cart/total-price/1')
      .send({ total_price: part.price * 3 })
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toEqual({ total_price: part.price * 3 });
  });

  it('should delete one cart item', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    await request(app.getHttpServer())
      .delete('/shopping-cart/one/1')
      .set('Cookie', login.headers['set-cookie']);

    const user = await prisma.user.findFirst({
      where: { username: mockedUser.username },
    });

    const response = await request(app.getHttpServer())
      .get(`/shopping-cart/${user.id}`)
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body.find((item) => item.partId === 1)).toBeUndefined();
  });

  it('should delete all carts items', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const user = await prisma.user.findFirst({
      where: { username: mockedUser.username },
    });

    await request(app.getHttpServer())
      .delete(`/shopping-cart/all/${user.id}`)
      .set('Cookie', login.headers['set-cookie']);

    const response = await request(app.getHttpServer())
      .get(`/shopping-cart/${user.id}`)
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toStrictEqual([]);
  });
});
