import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.interface';

@Injectable()
export class ProductsService {
  private products: Product[] = [
    { id: 'p-1', sku: 'SP-100', name: 'Solar Panel', price: 500, stock: 50 },
    { id: 'p-2', sku: 'HP-200', name: 'Heat Pump', price: 1500, stock: 20 },
    { id: 'p-3', sku: 'EV-300', name: 'EV Charger', price: 300, stock: 80 },
  ];

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  create(dto: CreateProductDto): Product {
    const product: Product = {
      id: uuidv4(),
      sku: dto.sku,
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
    };
    this.products.push(product);
    return product;
  }

  reduceStock(id: string, amount: number): Product {
    const product = this.findOne(id);
    if (product.stock < amount) {
      throw new Error('Insufficient stock');
    }
    product.stock -= amount;
    return product;
  }
}
