import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import PaymentSchema from '../../schemas/Payment.model';
import OrderSchema from '../../schemas/Order.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		ConfigModule,
		MongooseModule.forFeature([
			{ name: 'Payment', schema: PaymentSchema },
			{ name: 'Order', schema: OrderSchema },
		]),
		AuthModule,
	],
	providers: [PaymentService, PaymentResolver],
})
export class PaymentModule {}
