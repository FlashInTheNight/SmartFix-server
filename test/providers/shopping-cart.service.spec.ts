import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import * as session from 'express-session';
import * as passport from 'passport';
import { INestApplication } from '@nestjs/common';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { DbService } from 'src/db/db.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DbModule } from 'src/db/db.module';
import { BoilerPartsModule } from 'src/boiler-parts/boiler-parts.module';
import { ShoppingCartModule } from 'src/shopping-cart/shopping-cart.module';
import { ShoppingCartService } from 'src/shopping-cart/shopping-cart.service';

const mockedUser = {
  username: 'Boris',
  email: 'boris@gmail.com',
  password: 'boris123',
};

describe('Shopping Cart Service', () => {
  let app: INestApplication;
  let boilerPartsService: BoilerPartsService;
  let prisma: DbService;
  let shoppingCartService: ShoppingCartService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [DbModule, BoilerPartsModule, ShoppingCartModule],
    }).compile();

    boilerPartsService = testModule.get<BoilerPartsService>(BoilerPartsService);
    prisma = testModule.get<DbService>(DbService);
    shoppingCartService =
      testModule.get<ShoppingCartService>(ShoppingCartService);

    app = testModule.createNestApplication();

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

  it('should return all cart items', async () => {
    const user = await prisma.user.findFirst({
      where: { username: mockedUser.username },
    });

    const cart = await shoppingCartService.findAll(user.id);

    cart.forEach((item) =>
      expect(item).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          userId: user.id,
          partId: expect.any(Number),
          boiler_manufacturer: expect.any(String),
          price: expect.any(Number),
          parts_manufacturer: expect.any(String),
          name: expect.any(String),
          image: expect.any(String),
          count: expect.any(Number),
          total_price: expect.any(Number),
          in_stock: expect.any(Number),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      ),
    );
  });

  it('should add cart items', async () => {
    await shoppingCartService.add({
      username: mockedUser.username,
      partId: 3,
    });

    const user = await prisma.user.findFirst({
      where: { username: mockedUser.username },
    });

    const cart = await shoppingCartService.findAll(user.id);

    expect(cart.find((item) => item.partId === 3)).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        userId: user.id,
        partId: 3,
        boiler_manufacturer: expect.any(String),
        price: expect.any(Number),
        parts_manufacturer: expect.any(String),
        name: expect.any(String),
        image: expect.any(String),
        count: expect.any(Number),
        total_price: expect.any(Number),
        in_stock: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should return updated count', async () => {
    const result = await shoppingCartService.updateCount(2, 1);

    expect(result).toEqual({ count: 2 });
  });

  it('should return updated total price', async () => {
    const part = await boilerPartsService.findOne(1);
    const result = await shoppingCartService.updateTotalPrice(
      part.price * 3,
      1,
    );

    expect(result).toEqual({ total_price: part.price * 3 });
  });

  it('should delete cart item', async () => {
    await shoppingCartService.remove(1);

    const user = await prisma.user.findFirst({
      where: { username: mockedUser.username },
    });

    const cart = await shoppingCartService.findAll(user.id);

    expect(cart.find((item) => item.partId === 1)).toBeUndefined();
  });

  it('should delete all cart items', async () => {
    const user = await prisma.user.findFirst({
      where: { username: mockedUser.username },
    });

    await shoppingCartService.removeAll(user.id);

    const cart = await shoppingCartService.findAll(user.id);

    expect(cart).toStrictEqual([]);
  });
});
