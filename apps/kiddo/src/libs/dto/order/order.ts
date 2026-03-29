import { Field, Int, ObjectType } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/order.enum';

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

	@Field(() => String)
	orderStatus: OrderStatus;

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
