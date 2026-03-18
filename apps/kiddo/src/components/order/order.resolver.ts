import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { OrderService } from './order.service';
import { CreateOrderInput, OrdersInquiry, UpdateOrderStatus } from '../../libs/dto/order/order.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Member } from '../../libs/dto/member/member';
import { Order, Orders } from '../../libs/dto/order/order';

@Resolver()
export class OrderResolver {
	constructor(private readonly orderService: OrderService) {}

	// Member: create order
	@UseGuards(AuthGuard)
	@Mutation(() => Order)
	async createOrder(@Args('input') input: CreateOrderInput, @AuthMember() member: Member): Promise<Order> {
		return this.orderService.createOrder(member._id, input);
	}

	// Member: get my orders
	@UseGuards(AuthGuard)
	@Query(() => Orders)
	async getMyOrders(@Args('input') input: OrdersInquiry, @AuthMember() member: Member): Promise<Orders> {
		return this.orderService.getMyOrders(member._id, input);
	}

	// Member: cancel order
	@UseGuards(AuthGuard)
	@Mutation(() => Order)
	async cancelOrder(@Args('orderId') orderId: string, @AuthMember() member: Member): Promise<Order> {
		return this.orderService.cancelOrder(member._id, orderId);
	}

	// Admin: update order status
	@UseGuards(AuthGuard)
	@Mutation(() => Order)
	async updateOrderStatus(@Args('input') input: UpdateOrderStatus): Promise<Order> {
		return this.orderService.updateOrderStatus(input);
	}
}
