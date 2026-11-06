import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Task {
  id: number;
  title: string;
  description: string;
  done: boolean;
}

@Injectable()
export class TasksService {
  private dir = process.env.DATA_DIR ?? 'data';
  private file = join(this.dir, 'tasks.json');

  private load(): Task[] {
    if (!existsSync(this.file)) return [];
    return JSON.parse(readFileSync(this.file, 'utf-8')) as Task[];
  }

  private save(tasks: Task[]) {
    mkdirSync(this.dir, { recursive: true });
    writeFileSync(this.file, JSON.stringify(tasks, null, 2));
  }

  findAll() {
    return this.load();
  }

  findOne(id: number) {
    const task = this.load().find((t) => t.id === id);
    if (!task) throw new NotFoundException(`task ${id} nao encontrada`);
    return task;
  }

  create(data: Partial<Task>) {
    const tasks = this.load();
    const id = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const task: Task = {
      id,
      title: data.title ?? '',
      description: data.description ?? '',
      done: data.done ?? false,
    };
    tasks.push(task);
    this.save(tasks);
    return task;
  }

  // PUT troca a task inteira
  replace(id: number, data: Partial<Task>) {
    const tasks = this.load();
    const i = this.indexOf(tasks, id);
    tasks[i] = {
      id,
      title: data.title ?? '',
      description: data.description ?? '',
      done: data.done ?? false,
    };
    this.save(tasks);
    return tasks[i];
  }

  // PATCH muda so os campos enviados
  update(id: number, data: Partial<Task>) {
    const tasks = this.load();
    const i = this.indexOf(tasks, id);
    tasks[i] = { ...tasks[i], ...data, id };
    this.save(tasks);
    return tasks[i];
  }

  remove(id: number) {
    const tasks = this.load();
    const i = this.indexOf(tasks, id);
    const [removed] = tasks.splice(i, 1);
    this.save(tasks);
    return removed;
  }

  private indexOf(tasks: Task[], id: number) {
    const i = tasks.findIndex((t) => t.id === id);
    if (i === -1) throw new NotFoundException(`task ${id} nao encontrada`);
    return i;
  }
}
