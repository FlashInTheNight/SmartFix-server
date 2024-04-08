import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import type { IBoilerPartsQuery, IBoilerPartsFilter } from './types';
import type { BoilerParts } from '@prisma/client';

@Injectable()
export class BoilerPartsService {
  constructor(private db: DbService) {}
  async paginateAndFilter(
    query: IBoilerPartsQuery,
  ): Promise<{ count: number; rows: BoilerParts[] }> {
    const limit = +query.limit;
    const offset = +query.offset * 20;
    const filter = {} as Partial<IBoilerPartsFilter>;
    const queryFirstSort = query.first || 'popular';
    let orderBy = null;

    switch (queryFirstSort) {
      case 'popular':
        orderBy = {
          popularity: 'desc',
        };
        break;
      case 'cheap':
        orderBy = {
          price: 'asc',
        };
        break;
      case 'expensive':
        orderBy = {
          price: 'desc',
        };
        break;
      default:
        console.error('invalid operation in queryFirstSort switch');
    }

    if (query.priceFrom && query.priceTo) {
      filter.price = {
        gte: +query.priceFrom,
        lte: +query.priceTo,
      };
    }

    if (query.boiler) {
      filter.boiler_manufacturer = JSON.parse(decodeURIComponent(query.boiler));
    }

    if (query.parts) {
      filter.parts_manufacturer = JSON.parse(decodeURIComponent(query.parts));
    }

    const result = await this.db.boilerParts.findMany({
      take: limit,
      skip: offset,
      where: {
        ...filter,
        boiler_manufacturer: {
          in: filter.boiler_manufacturer,
        },
        parts_manufacturer: {
          in: filter.parts_manufacturer,
        },
      },
      orderBy,
    });

    const count = await this.db.boilerParts.count({
      where: {
        ...filter,
        boiler_manufacturer: {
          in: filter.boiler_manufacturer,
        },
        parts_manufacturer: {
          in: filter.parts_manufacturer,
        },
      },
    });

    return { count, rows: result };
  }

  async bestsellers(): Promise<{ count: number; rows: BoilerParts[] }> {
    const rows = await this.db.boilerParts.findMany({
      where: { bestseller: true },
    });

    const count = await this.db.boilerParts.count({
      where: { bestseller: true },
    });

    return { count, rows };
  }

  async new(): Promise<{ count: number; rows: BoilerParts[] }> {
    const rows = await this.db.boilerParts.findMany({
      where: { new: true },
    });

    const count = await this.db.boilerParts.count({
      where: { new: true },
    });

    return { count, rows };
  }

  async findOne(id: number | string): Promise<BoilerParts | null> {
    return await this.db.boilerParts.findUnique({
      where: { id: Number(id) },
    });
  }

  // async findOne(id: number | string): Promise<BoilerParts> {
  //   return this.prisma.boilerParts.findFirst({
  //     where: { id: Number(id) },
  //     rejectOnNotFound: true,
  //   });
  // }

  async findOneByName(name: string): Promise<BoilerParts | null> {
    return await this.db.boilerParts.findFirst({
      where: { name },
    });
  }

  async searchByString(
    str: string,
  ): Promise<{ count: number; rows: BoilerParts[] }> {
    const rows = await this.db.boilerParts.findMany({
      take: 20,
      where: { name: { contains: str } },
    });

    const count = await this.db.boilerParts.count({
      where: { name: { contains: str } },
    });

    return { count, rows };
  }
}
