import { Module } from '@nestjs/common';
import { KiddoBatchController } from './kiddo-batch.controller';
import { KiddoBatchService } from './kiddo-batch.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [KiddoBatchController],
  providers: [KiddoBatchService],
})
export class KiddoBatchModule {}
