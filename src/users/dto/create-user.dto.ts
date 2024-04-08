import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Joe' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '123123' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'sample@mail.ru' })
  @IsNotEmpty()
  email: string;
}
