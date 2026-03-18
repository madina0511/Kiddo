import { Field, Int, ObjectType } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/order.enum';

@ObjectType()
export class OrderItem {
	@Field(() => String)
	productId: string;

	@Field(() => String)
	productName: string;

	@Field(() => String)
	productImage: string;

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

	@Field(() => [TotalCounter])
	metaCounter: TotalCounter[];
}

@ObjectType()
export class TotalCounter {
	@Field(() => Int)
	total: number;
}
