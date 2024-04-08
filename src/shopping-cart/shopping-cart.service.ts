import { Injectable } from '@nestjs/common';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { DbService } from 'src/db/db.service';
import { UsersService } from 'src/users/users.service';
import type { ShoppingCart } from '@prisma/client';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class ShoppingCartService {
  constructor(
    private db: DbService,
    private readonly userService: UsersService,
    private readonly boilerPartsService: BoilerPartsService,
  ) {}

  async findAll(userId: number): Promise<ShoppingCart[]> {
    return await this.db.shoppingCart.findMany({ where: { userId } });
  }

  async add(addToCartDto: AddToCartDto) {
    const user = await this.db.user.findFirst({
      where: { username: addToCartDto.username },
    });
    const part = await this.db.boilerParts.findUnique({
      where: { id: +addToCartDto.partId },
    });

    const cart = await this.db.shoppingCart.create({
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

    return cart;
  }

  async updateCount(count: number, partId: number): Promise<{ count: number }> {
    const cart = await this.db.shoppingCart.findFirst({
      where: { partId },
    });

    if (!cart) {
      throw new Error('ShoppingCart с данным partId не найден');
    }

    const updatedCart = await this.db.shoppingCart.update({
      where: { id: cart.id },
      data: { count },
    });

    return { count: updatedCart.count };
  }

  async updateTotalPrice(
    total_price: number,
    partId: number,
  ): Promise<{ total_price: number }> {
    const cart = await this.db.shoppingCart.findFirst({ where: { partId } });

    if (!cart) {
      throw new Error('ShoppingCart с данным partId не найден');
    }

    const updatedCart = await this.db.shoppingCart.update({
      where: { id: cart.id },
      data: { total_price },
    });

    return { total_price: updatedCart.total_price };
  }

  async remove(partId: number): Promise<void> {
    const cart = await this.db.shoppingCart.findFirst({
      where: { partId },
    });

    if (!cart) {
      throw new Error('ShoppingCart с данным partId не найден');
    }

    await this.db.shoppingCart.delete({
      where: { id: cart.id },
    });
  }

  async removeAll(userId: number): Promise<void> {
    await this.db.shoppingCart.deleteMany({
      where: { userId },
    });
  }
}
