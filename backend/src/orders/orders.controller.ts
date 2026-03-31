import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { RouteStatus } from './order.enums';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Patch(':id/status')
  advanceStatus(@Param('id') id: string) {
    return this.ordersService.advanceStatus(id);
  }

  @Patch(':id/assign-route')
  assignRoute(@Param('id') id: string, @Body('routeId') routeId: string) {
    return this.ordersService.assignRoute(id, routeId);
  }

  @Patch(':id/route-status')
  updateRouteStatus(@Param('id') id: string, @Body('routeStatus') routeStatus: RouteStatus) {
    return this.ordersService.updateRouteStatus(id, routeStatus);
  }
}
