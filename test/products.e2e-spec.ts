import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AppModule } from './../src/app.module.js';

process.env.DATA_DIR = mkdtempSync(join(tmpdir(), 'products-'));

async function start() {
  const mod = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = mod.createNestApplication();
  await app.init();
  return app;
}

describe('products', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await start();
  });

  afterAll(async () => {
    await app.close();
  });

  it('crud completo', async () => {
    const server = app.getHttpServer();

    const created = await request(server)
      .post('/products')
      .send({ name: 'teclado', price: 150, stock: 10 })
      .expect(201);
    expect(created.body).toEqual({
      id: 1,
      name: 'teclado',
      price: 150,
      stock: 10,
    });

    await request(server).get('/products').expect(200).expect([created.body]);
    await request(server).get('/products/1').expect(200);

    const put = await request(server)
      .put('/products/1')
      .send({ name: 'teclado mecanico', price: 300 })
      .expect(200);
    expect(put.body).toEqual({
      id: 1,
      name: 'teclado mecanico',
      price: 300,
      stock: 0,
    });

    const patch = await request(server)
      .patch('/products/1')
      .send({ stock: 5 })
      .expect(200);
    expect(patch.body).toEqual({
      id: 1,
      name: 'teclado mecanico',
      price: 300,
      stock: 5,
    });

    await request(server).delete('/products/1').expect(200);
    await request(server).get('/products/1').expect(404);
  });

  it('dados continuam depois de reiniciar', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'mouse', price: 80, stock: 3 })
      .expect(201);

    await app.close();
    app = await start();

    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(res.body.map((p: { name: string }) => p.name)).toContain('mouse');
  });
});
