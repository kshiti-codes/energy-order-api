import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { Product, OrderStatus } from './order.enums';
import { UsersModule } from '../users/users.module';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('returns an empty array when no orders exist', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('returns all created orders', () => {
      service.create({ customerName: 'Anna Müller', customerEmail: 'anna@example.com', product: Product.SOLAR_PANEL });
      service.create({ customerName: 'Anna Müller', customerEmail: 'anna@example.com', product: Product.HEAT_PUMP });
      expect(service.findAll()).toHaveLength(2);
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates an order with status PENDING', () => {
      const order = service.create({ customerName: 'Anna Müller', customerEmail: 'anna@example.com', product: Product.SOLAR_PANEL });
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('assigns a uuid as id', () => {
      const order = service.create({ customerName: 'Anna Müller', customerEmail: 'anna@example.com', product: Product.SOLAR_PANEL });
      expect(order.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('stores the correct customerName and product', () => {
      // create base solar requirement before EV
      service.create({ customerName: 'Anna Müller', customerEmail: 'anna@example.com', product: Product.SOLAR_PANEL });
      const order = service.create({ customerName: 'Anna Müller', customerEmail: 'anna@example.com', product: Product.EV_CHARGER });
      expect(order.customerName).toBe('Anna Müller');
      expect(order.product).toBe(Product.EV_CHARGER);
    });

    it('sets createdAt to a valid Date', () => {
      // create solar first as precondition for heat pump
      service.create({ customerName: 'Test', customerEmail: 'test@example.com', product: Product.SOLAR_PANEL });
      const order = service.create({ customerName: 'Test', customerEmail: 'test@example.com', product: Product.HEAT_PUMP });
      expect(order.createdAt).toBeInstanceOf(Date);
    });

    it('increments total orders count', () => {
      service.create({ customerName: 'A', customerEmail: 'a@example.com', product: Product.SOLAR_PANEL });
      service.create({ customerName: 'A', customerEmail: 'a@example.com', product: Product.HEAT_PUMP });
      expect(service.findAll()).toHaveLength(2);
    });

    it('rejects HEAT_PUMP when no prior SOLAR_PANEL exists for the same user', () => {
      expect(() =>
        service.create({ customerName: 'Bob', customerEmail: 'bob@example.com', product: Product.HEAT_PUMP }),
      ).toThrow('Dependencies not met');
    });
  });

  // ─── advanceStatus ──────────────────────────────────────────────────────────

  describe('advanceStatus()', () => {
    it('advances status from PENDING to CONFIRMED', () => {
      const order = service.create({ customerName: 'Anna', customerEmail: 'anna@example.com', product: Product.SOLAR_PANEL });
      const updated = service.advanceStatus(order.id);
      expect(updated.status).toBe(OrderStatus.CONFIRMED);
    });

    it('advances status through the full lifecycle', () => {
      const order = service.create({ customerName: 'Anna', customerEmail: 'anna@example.com', product: Product.SOLAR_PANEL });
      service.advanceStatus(order.id); // PENDING → CONFIRMED
      service.advanceStatus(order.id); // CONFIRMED → PROCESSING
      service.advanceStatus(order.id); // PROCESSING → SHIPPED
      const delivered = service.advanceStatus(order.id); // SHIPPED → DELIVERED
      expect(delivered.status).toBe(OrderStatus.DELIVERED);
    });

    it('does not change status when already DELIVERED', () => {
      const order = service.create({ customerName: 'Anna', customerEmail: 'anna@example.com', product: Product.SOLAR_PANEL });
      service.advanceStatus(order.id); // PENDING → CONFIRMED
      service.advanceStatus(order.id); // CONFIRMED → PROCESSING
      service.advanceStatus(order.id); // PROCESSING → SHIPPED
      service.advanceStatus(order.id); // SHIPPED → DELIVERED
      const updated = service.advanceStatus(order.id); // should stay DELIVERED
      expect(updated.status).toBe(OrderStatus.DELIVERED);
    });

    it('throws NotFoundException for unknown id', () => {
      expect(() => service.advanceStatus('non-existent-id')).toThrow(NotFoundException);
    });

    it('throws NotFoundException with a meaningful message', () => {
      expect(() => service.advanceStatus('bad-id')).toThrow('Order bad-id not found');
    });
  });
});