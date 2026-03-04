import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.interface';
import { OrderStatus } from './order.enums';

const STATUS_PROGRESSION: Record<OrderStatus, OrderStatus | null> = {
  [OrderStatus.PENDING]: OrderStatus.CONFIRMED,
  [OrderStatus.CONFIRMED]: OrderStatus.COMPLETED,
  [OrderStatus.COMPLETED]: null,
};

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  findAll(): Order[] {
    return this.orders;
  }

  create(createOrderDto: CreateOrderDto): Order {
    const order: Order = {
      id: uuidv4(),
      customerName: createOrderDto.customerName,
      product: createOrderDto.product,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    };
    this.orders.push(order);
    return order;
  }

  advanceStatus(id: string): Order {
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const next = STATUS_PROGRESSION[order.status];
    if (next) order.status = next;

    return order;
  }
}
