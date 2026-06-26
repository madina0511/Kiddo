import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiGateway } from './ai.gateway';
import { AiResolver } from './ai.resolver';
import { EmbeddingDoc, EmbeddingDocSchema } from './schemas/embedding-doc.schema';
import { AuthModule } from '../auth/auth.module';
import ProductSchema from '../../schemas/Product.model';
import OrderSchema from '../../schemas/Order.model';

@Module({
	imports: [
		ConfigModule,
		MongooseModule.forFeature([
			{ name: EmbeddingDoc.name, schema: EmbeddingDocSchema },
			{ name: 'Product', schema: ProductSchema },
			{ name: 'Order', schema: OrderSchema },
		]),
		AuthModule,
	],
	providers: [AiService, AiGateway, AiResolver],
})
export class AiModule {}
