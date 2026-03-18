import { registerEnumType } from '@nestjs/graphql';
import { Order } from '../dto/order/order';

export enum OrderStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	SHIPPED = 'SHIPPED',
	DELIVERED = 'DELIVERED',
	CANCELLED = 'CANCELLED',
}
registerEnumType(OrderStatus, {
	name: 'OrderStatus',
});
