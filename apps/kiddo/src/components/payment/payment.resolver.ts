import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { PaymentService } from './payment.service';
import { ConfirmPaymentInput, CancelPaymentInput } from '../../libs/dto/payment/payment.input';
import { Payment } from '../../libs/dto/payment/payment';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Member } from '../../libs/dto/member/member';

@Resolver()
export class PaymentResolver {
	constructor(private readonly paymentService: PaymentService) {}

	// Member: confirm payment (checkout muvaffaqiyatli bo'lgach chaqiriladi)
	@UseGuards(AuthGuard)
	@Mutation(() => Payment)
	async confirmPayment(@Args('input') input: ConfirmPaymentInput, @AuthMember() member: Member): Promise<Payment> {
		return this.paymentService.confirmPayment(member._id, input);
	}

	// Member: cancel/refund payment
	@UseGuards(AuthGuard)
	@Mutation(() => Payment)
	async cancelPayment(@Args('input') input: CancelPaymentInput, @AuthMember() member: Member): Promise<Payment> {
		return this.paymentService.cancelPayment(member._id, input);
	}

	// Member: get payment by order id
	@UseGuards(AuthGuard)
	@Query(() => Payment)
	async getPaymentByOrderId(@Args('orderId') orderId: string): Promise<Payment> {
		return this.paymentService.getPaymentByOrderId(orderId);
	}
}
