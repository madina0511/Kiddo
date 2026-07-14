import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import OrderSchema from '../../schemas/Order.model';
import { AuthModule } from '../auth/auth.module';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]), AuthModule, ExchangeRateModule],
	providers: [OrderResolver, OrderService],
})
export class OrderModule {}
