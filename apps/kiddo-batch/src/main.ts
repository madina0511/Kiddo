import { NestFactory } from '@nestjs/core';
import { KiddoBatchModule } from './kiddo-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(KiddoBatchModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
