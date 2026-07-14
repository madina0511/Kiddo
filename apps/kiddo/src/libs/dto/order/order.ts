import { Field, Int, ObjectType } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/order.enum';

// 1. Address ObjectType qo'shildi
@ObjectType()
export class Address {
	@Field(() => String)
	recipientName: string;

	@Field(() => String)
	phone: string;

	@Field(() => String)
	zipCode: string;

	@Field(() => String)
	address: string;

	@Field(() => String, { nullable: true })
	addressDetail?: string;

	@Field(() => String, { nullable: true })
	deliveryNote?: string;
}

@ObjectType()
export class OrderItem {
	@Field(() => String)
	productId: string;

	@Field(() => String)
	productName: string;

	@Field(() => String)
	productImages: string;

	@Field(() => Int)
	quantity: number;

	@Field(() => Int)
	price: number;
}

@ObjectType()
export class Order {
	@Field(() => String)
	_id: string;

	@Field(() => String)
	memberId: string;

	@Field(() => String)
	orderNumber: string;

	@Field(() => [OrderItem])
	items: OrderItem[];

	@Field(() => Int)
	totalAmount: number;

	@Field(() => Int)
	totalAmountKRW: number;

	@Field(() => String)
	orderStatus: OrderStatus;

	// 2. address qo'shildi
	@Field(() => Address)
	address: Address;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class Orders {
	@Field(() => [Order])
	list: Order[];

	@Field(() => [OrderTotalCounter])
	metaCounter: OrderTotalCounter[];
}

@ObjectType()
export class OrderTotalCounter {
	@Field(() => Int)
	total: number;
}
