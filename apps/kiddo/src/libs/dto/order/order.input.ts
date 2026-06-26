import { Field, InputType, Int } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/order.enum';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min, IsString } from 'class-validator';

// 1. AddressInput qo'shildi
@InputType()
export class AddressInput {
	@IsNotEmpty()
	@Field(() => String)
	recipientName: string;

	@IsNotEmpty()
	@Field(() => String)
	phone: string;

	@IsNotEmpty()
	@Field(() => String)
	zipCode: string;

	@IsNotEmpty()
	@Field(() => String)
	address: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	addressDetail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	deliveryNote?: string;
}

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
	productImages: string;

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

	// 2. address qo'shildi
	@IsNotEmpty()
	@Field(() => AddressInput)
	address: AddressInput;
}

// ... qolgan DTOlar o'zgarmadi
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
