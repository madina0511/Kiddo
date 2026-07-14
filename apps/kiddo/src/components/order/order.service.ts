import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { Order, Orders } from '../../libs/dto/order/order';
import { CreateOrderInput, OrdersInquiry, UpdateOrderStatus } from '../../libs/dto/order/order.input';
import { OrderStatus } from '../../libs/enums/order.enum';
@Injectable()
export class OrderService {
	constructor(
		@InjectModel('Order') private readonly orderModel: Model<Order>,
		private readonly exchangeRateService: ExchangeRateService,
	) {}

	// Create Order

	async createOrder(memberId: ObjectId, input: CreateOrderInput): Promise<Order> {
		const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
		const totalAmountKRW = await this.exchangeRateService.convertUsdToKrw(input.totalAmount);

		return this.orderModel.create({
			memberId,
			orderNumber,
			items: input.items,
			totalAmount: input.totalAmount,
			totalAmountKRW,
			address: input.address,
			orderStatus: OrderStatus.PENDING,
		});
	}
	// Get my orders (paginated)
	async getMyOrders(memberId: ObjectId, input: OrdersInquiry): Promise<Orders> {
		const { page, limit, search } = input;
		const match: any = { memberId };

		if (search?.orderStatus) {
			match.orderStatus = search.orderStatus;
		}

		const result = await this.orderModel.aggregate([
			{ $match: match },
			{ $sort: { createdAt: -1 } },
			{
				$facet: {
					list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);

		return result[0] ?? { list: [], metaCounter: [{ total: 0 }] };
	}

	// Cancel order (only PENDING orders)
	async cancelOrder(memberId: ObjectId, orderId: string): Promise<Order> {
		const order = await this.orderModel.findById(orderId);
		if (!order) throw new NotFoundException('Order not found');
		if (order.memberId.toString() !== memberId.toString()) {
			throw new ForbiddenException('Not your order');
		}
		if (order.orderStatus !== OrderStatus.PENDING) {
			throw new ForbiddenException('Only PENDING orders can be cancelled');
		}
		order.orderStatus = OrderStatus.CANCELLED;
		return order.save();
	}

	// Admin: update order status
	async updateOrderStatus(input: UpdateOrderStatus): Promise<Order> {
		const { orderId, orderStatus } = input;
		const order = await this.orderModel.findByIdAndUpdate(orderId, { orderStatus }, { new: true });
		if (!order) throw new NotFoundException('Order not found');
		return order;
	}
}
