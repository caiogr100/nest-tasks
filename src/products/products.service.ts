import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

@Injectable()
export class ProductsService {
  private dir = process.env.DATA_DIR ?? 'data';
  private file = join(this.dir, 'products.json');

  private load(): Product[] {
    if (!existsSync(this.file)) return [];
    return JSON.parse(readFileSync(this.file, 'utf-8')) as Product[];
  }

  private save(products: Product[]) {
    mkdirSync(this.dir, { recursive: true });
    writeFileSync(this.file, JSON.stringify(products, null, 2));
  }

  findAll() {
    return this.load();
  }

  findOne(id: number) {
    const product = this.load().find((p) => p.id === id);
    if (!product) throw new NotFoundException(`produto ${id} nao encontrado`);
    return product;
  }

  create(data: Partial<Product>) {
    const products = this.load();
    const id = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const product: Product = {
      id,
      name: data.name ?? '',
      price: data.price ?? 0,
      stock: data.stock ?? 0,
    };
    products.push(product);
    this.save(products);
    return product;
  }

  replace(id: number, data: Partial<Product>) {
    const products = this.load();
    const i = this.indexOf(products, id);
    products[i] = {
      id,
      name: data.name ?? '',
      price: data.price ?? 0,
      stock: data.stock ?? 0,
    };
    this.save(products);
    return products[i];
  }

  update(id: number, data: Partial<Product>) {
    const products = this.load();
    const i = this.indexOf(products, id);
    products[i] = { ...products[i], ...data, id };
    this.save(products);
    return products[i];
  }

  remove(id: number) {
    const products = this.load();
    const i = this.indexOf(products, id);
    const [removed] = products.splice(i, 1);
    this.save(products);
    return removed;
  }

  private indexOf(products: Product[], id: number) {
    const i = products.findIndex((p) => p.id === id);
    if (i === -1) throw new NotFoundException(`produto ${id} nao encontrado`);
    return i;
  }
}
