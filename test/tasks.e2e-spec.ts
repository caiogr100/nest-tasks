import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AppModule } from './../src/app.module.js';

process.env.DATA_DIR = mkdtempSync(join(tmpdir(), 'tasks-'));

async function start() {
  const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = mod.createNestApplication();
  await app.init();
  return app;
}

describe('tasks', () => {
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
      .post('/tasks')
      .send({ title: 'estudar nest', description: 'aula 6/nov' })
      .expect(201);
    expect(created.body).toEqual({
      id: 1,
      title: 'estudar nest',
      description: 'aula 6/nov',
      done: false,
    });

    await request(server).get('/tasks').expect(200).expect([created.body]);
    await request(server).get('/tasks/1').expect(200);

    const put = await request(server)
      .put('/tasks/1')
      .send({ title: 'estudar nest de novo' })
      .expect(200);
    expect(put.body).toEqual({
      id: 1,
      title: 'estudar nest de novo',
      description: '',
      done: false,
    });

    const patch = await request(server)
      .patch('/tasks/1')
      .send({ done: true })
      .expect(200);
    expect(patch.body.done).toBe(true);
    expect(patch.body.title).toBe('estudar nest de novo');

    await request(server).delete('/tasks/1').expect(200);
    await request(server).get('/tasks/1').expect(404);
  });

  it('dados continuam depois de reiniciar', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'sobrevive ao restart' })
      .expect(201);

    await app.close();
    app = await start();

    const res = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(res.body.map((t: { title: string }) => t.title)).toContain(
      'sobrevive ao restart',
    );
  });
});
