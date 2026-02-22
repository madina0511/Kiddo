import { NestFactory } from '@nestjs/core';
import { KiddoBatchModule } from './kiddo-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(KiddoBatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();
