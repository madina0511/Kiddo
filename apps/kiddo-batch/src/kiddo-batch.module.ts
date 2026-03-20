import { Module } from '@nestjs/common';
import { KiddoBatchController } from './kiddo-batch.controller';
import { KiddoBatchService } from './kiddo-batch.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './data-base/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import ProductSchema from 'apps/kiddo/src/schemas/Product.model';
import MemberSchema from 'apps/kiddo/src/schemas/Member.model';
@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		ScheduleModule.forRoot(),
		MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
	],
	controllers: [KiddoBatchController],
	providers: [KiddoBatchService],
})
export class KiddoBatchModule {}
