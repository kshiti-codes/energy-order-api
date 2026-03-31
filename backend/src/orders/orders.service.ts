import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.interface';
import { OrderStatus, Product, RouteStatus } from './order.enums';
import { UsersService } from '../users/users.service';

const STATUS_PROGRESSION: Record<OrderStatus, OrderStatus | null> = {
  [OrderStatus.PENDING]: OrderStatus.CONFIRMED,
  [OrderStatus.CONFIRMED]: OrderStatus.PROCESSING,
  [OrderStatus.PROCESSING]: OrderStatus.SHIPPED,
  [OrderStatus.SHIPPED]: OrderStatus.DELIVERED,
  [OrderStatus.DELIVERED]: null,
  [OrderStatus.CANCELED]: null,
};

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  constructor(private readonly usersService: UsersService) {}

  findAll(): Order[] {
    return this.orders;
  }

  hasSolarPanelOrder(customerId?: string, customerEmail?: string): boolean {
    return this.orders.some((order) => {
      if (order.product !== Product.SOLAR_PANEL) return false;
      if (customerId && order.customerId === customerId) return true;
      if (customerEmail && order.customerEmail?.toLowerCase() === customerEmail.toLowerCase()) return true;
      return false;
    });
  }

  findOne(id: string): Order {
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  create(createOrderDto: CreateOrderDto): Order {
    const email = createOrderDto.customerEmail?.trim().toLowerCase();
    if (!email && !createOrderDto.customerId) {
      throw new BadRequestException('customerEmail or customerId is required');
    }

    let customerId = createOrderDto.customerId;
    let user = customerId ? this.usersService.findOne(customerId) : undefined;

    if (!user && email) {
      user = this.usersService.findByEmail(email);
    }

    if (!user && email) {
      user = this.usersService.create({
        name: createOrderDto.customerName,
        email,
      });
      customerId = user.id;
    }

    if (!user) {
      throw new BadRequestException('User not found and could not be created.');
    }

    const product = createOrderDto.product;
    if ((product === Product.HEAT_PUMP || product === Product.EV_CHARGER) && !this.hasSolarPanelOrder(customerId, email)) {
      throw new BadRequestException('Dependencies not met: Solar Panel must exist before HEAT_PUMP or EV_CHARGER for this user');
    }

    const order: Order = {
      id: uuidv4(),
      customerId,
      customerEmail: user.email,
      customerName: createOrderDto.customerName,
      product,
      status: OrderStatus.PENDING,
      routeStatus: RouteStatus.UNASSIGNED,
      deliveryAddress: createOrderDto.deliveryAddress,
      createdAt: new Date(),
    };
    this.orders.push(order);
    return order;
  }

  advanceStatus(id: string): Order {
    const order = this.findOne(id);

    const next = STATUS_PROGRESSION[order.status];
    if (!next) return order;

    order.status = next;
    return order;
  }

  assignRoute(id: string, routeId: string): Order {
    const order = this.findOne(id);
    order.routeId = routeId;
    order.routeStatus = RouteStatus.ASSIGNED;
    return order;
  }

  updateRouteStatus(id: string, routeStatus: RouteStatus): Order {
    const order = this.findOne(id);
    order.routeStatus = routeStatus;
    return order;
  }
}
