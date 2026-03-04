import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Product } from './order.enums';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEnum(Product)
  product: Product;
}
