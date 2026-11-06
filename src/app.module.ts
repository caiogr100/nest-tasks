import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksModule } from './tasks/tasks.module.js';
import { ProductsModule } from './products/products.module.js';

@Module({
  imports: [TasksModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
