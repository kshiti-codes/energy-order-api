import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { Product, OrderStatus } from './order.enums';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      service.create({ customerName: 'Anna Müller', product: Product.SOLAR_PANEL });
      service.create({ customerName: 'Max Bauer', product: Product.HEAT_PUMP });
      expect(service.findAll()).toHaveLength(2);
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates an order with status PENDING', () => {
      const order = service.create({ customerName: 'Anna Müller', product: Product.SOLAR_PANEL });
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('assigns a uuid as id', () => {
      const order = service.create({ customerName: 'Anna Müller', product: Product.SOLAR_PANEL });
      expect(order.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('stores the correct customerName and product', () => {
      const order = service.create({ customerName: 'Anna Müller', product: Product.EV_CHARGER });
      expect(order.customerName).toBe('Anna Müller');
      expect(order.product).toBe(Product.EV_CHARGER);
    });

    it('sets createdAt to a valid Date', () => {
      const order = service.create({ customerName: 'Test', product: Product.HEAT_PUMP });
      expect(order.createdAt).toBeInstanceOf(Date);
    });

    it('increments total orders count', () => {
      service.create({ customerName: 'A', product: Product.SOLAR_PANEL });
      service.create({ customerName: 'B', product: Product.HEAT_PUMP });
      expect(service.findAll()).toHaveLength(2);
    });
  });

  // ─── advanceStatus ──────────────────────────────────────────────────────────

  describe('advanceStatus()', () => {
    it('advances status from PENDING to CONFIRMED', () => {
      const order = service.create({ customerName: 'Anna', product: Product.SOLAR_PANEL });
      const updated = service.advanceStatus(order.id);
      expect(updated.status).toBe(OrderStatus.CONFIRMED);
    });

    it('advances status from CONFIRMED to COMPLETED', () => {
      const order = service.create({ customerName: 'Anna', product: Product.SOLAR_PANEL });
      service.advanceStatus(order.id); // PENDING → CONFIRMED
      const updated = service.advanceStatus(order.id); // CONFIRMED → COMPLETED
      expect(updated.status).toBe(OrderStatus.COMPLETED);
    });

    it('does not change status when already COMPLETED', () => {
      const order = service.create({ customerName: 'Anna', product: Product.SOLAR_PANEL });
      service.advanceStatus(order.id); // PENDING → CONFIRMED
      service.advanceStatus(order.id); // CONFIRMED → COMPLETED
      const updated = service.advanceStatus(order.id); // should stay COMPLETED
      expect(updated.status).toBe(OrderStatus.COMPLETED);
    });

    it('throws NotFoundException for unknown id', () => {
      expect(() => service.advanceStatus('non-existent-id')).toThrow(NotFoundException);
    });

    it('throws NotFoundException with a meaningful message', () => {
      expect(() => service.advanceStatus('bad-id')).toThrow('Order bad-id not found');
    });
  });
});