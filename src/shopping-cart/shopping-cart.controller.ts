import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import {
  GetAllResponse,
  AddToCardResponse,
  UpdateCountResponse,
  UpdateCountRequest,
  TotalPriceResponse,
  TotalPriceRequest,
} from './types';
import { ShoppingCartService } from './shopping-cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}
  @ApiOkResponse({ type: [GetAllResponse] })
  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  getAll(@Param('id', ParseIntPipe) userId: number) {
    return this.shoppingCartService.findAll(userId);
  }

  @ApiOkResponse({ type: AddToCardResponse })
  @UseGuards(AuthenticatedGuard)
  @Post('/add')
  addToCar(@Body() addToCartDto: AddToCartDto) {
    // let count = new ParseIntPipe().transform(body.count);
    return this.shoppingCartService.add(addToCartDto);
  }

  @ApiOkResponse({ type: UpdateCountResponse })
  @ApiBody({ type: UpdateCountRequest })
  @UseGuards(AuthenticatedGuard)
  @Patch('/count/:id')
  updateCount(
    @Body('count', ParseIntPipe) count: number,
    @Param('id', ParseIntPipe) partId: number,
  ) {
    return this.shoppingCartService.updateCount(count, partId);
  }

  @ApiOkResponse({ type: TotalPriceResponse })
  @ApiBody({ type: TotalPriceRequest })
  @UseGuards(AuthenticatedGuard)
  @Patch('/total-price/:id')
  updateTotalPrice(
    @Body('total_price', ParseIntPipe) total_price: number,
    @Param('id', ParseIntPipe) partId: number,
  ) {
    return this.shoppingCartService.updateTotalPrice(total_price, partId);
  }

  // @UseGuards(AuthenticatedGuard)
  @Delete('/one/:id')
  removeOne(@Param('id', ParseIntPipe) partId: number) {
    return this.shoppingCartService.remove(partId);
  }

  // @UseGuards(AuthenticatedGuard)
  @Delete('/all/:id')
  removeAll(@Param('id', ParseIntPipe) userId: number) {
    return this.shoppingCartService.removeAll(userId);
  }
}
