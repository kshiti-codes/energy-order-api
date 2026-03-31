import { OrderStatus, Product, RouteStatus } from './order.enums';

export interface Order {
  id: string;
  customerId?: string;
  customerEmail?: string;
  customerName: string;
  product: Product;
  status: OrderStatus;
  routeId?: string;
  routeStatus: RouteStatus;
  deliveryAddress?: string;
  createdAt: Date;
}
