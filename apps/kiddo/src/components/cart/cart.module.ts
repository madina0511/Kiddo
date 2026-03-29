import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';
import { AuthModule } from '../auth/auth.module';
import CartSchema from '../../schemas/cart.model';
import { ProductModule } from '../product/product.module';
import ProductSchema from '../../schemas/Product.model';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema }]),
		MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
		AuthModule,
		ProductModule,
	],
	providers: [CartResolver, CartService],
	exports: [CartService],
})
export class CartModule {}
