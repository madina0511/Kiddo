import { Field, InputType, Int } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/order.enum';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

@InputType()
export class OrderItemInput {
	@IsNotEmpty()
	@Field(() => String)
	productId: string;

	@IsNotEmpty()
	@Field(() => String)
	productName: string;

	@IsNotEmpty()
	@Field(() => String)
	productImage: string;

	@Min(1)
	@IsInt()
	@Field(() => Int)
	quantity: number;

	@Min(0)
	@IsInt()
	@Field(() => Int)
	price: number;
}

@InputType()
export class CreateOrderInput {
	@Field(() => [OrderItemInput])
	items: OrderItemInput[];

	@Min(0)
	@IsInt()
	@Field(() => Int)
	totalAmount: number;
}

@InputType()
export class OrdersInquirySearch {
	@IsOptional()
	@Field(() => OrderStatus, { nullable: true })
	orderStatus?: OrderStatus;
}

@InputType()
export class OrdersInquiry {
	@Min(1)
	@IsInt()
	@Field(() => Int, { defaultValue: 1 })
	page: number;

	@Min(1)
	@IsInt()
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => OrdersInquirySearch, { nullable: true })
	search?: OrdersInquirySearch;
}

@InputType()
export class UpdateOrderStatus {
	@IsNotEmpty()
	@Field(() => String)
	orderId: string;

	@Field(() => OrderStatus)
	orderStatus: OrderStatus;
}
