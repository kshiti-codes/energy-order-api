import { Product, OrderStatus } from './order.enums';

export interface Order {
  id: string;
  customerName: string;
  product: Product;
  status: OrderStatus;
  createdAt: Date;
}
