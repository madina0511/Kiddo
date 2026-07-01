import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class ConfirmPaymentInput {
	@IsString()
	@IsNotEmpty()
	@Field()
	paymentKey: string;

	@IsString()
	@IsNotEmpty()
	@Field()
	orderId: string; // tossOrderId (Toss'ga yuborilgan)

	@IsString()
	@IsNotEmpty()
	@Field()
	mongoOrderId: string; // bizning Order._id

	@IsNumber()
	@IsNotEmpty()
	@Field(() => Int)
	amount: number;
}

@InputType()
export class CancelPaymentInput {
	@IsString()
	@IsNotEmpty()
	@Field()
	paymentKey: string;

	@IsString()
	@IsNotEmpty()
	@Field()
	cancelReason: string;

	@IsNumber()
	@IsOptional()
	@Field(() => Int, { nullable: true })
	cancelAmount?: number;
}
