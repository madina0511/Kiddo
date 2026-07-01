import {
	Injectable,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import axios from 'axios';

import { Payment, PaymentStatus } from '../../libs/dto/payment/payment';
import { ConfirmPaymentInput, CancelPaymentInput } from '../../libs/dto/payment/payment.input';
import { OrderStatus } from '../../libs/enums/order.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class PaymentService {
	private readonly logger = new Logger(PaymentService.name);
	private readonly TOSS_API_URL = 'https://api.tosspayments.com/v1/payments';
	private readonly secretKey = process.env.TOSS_SECRET_KEY;

	constructor(
		@InjectModel('Payment') private readonly paymentModel: Model<Payment>,
		@InjectModel('Order') private readonly orderModel: Model<any>,
	) {}

	private getAuthHeader() {
		const encoded = Buffer.from(`${this.secretKey}:`).toString('base64');
		return { Authorization: `Basic ${encoded}`, 'Content-Type': 'application/json' };
	}

	// Confirm payment (checkout muvaffaqiyatli bo'lgach chaqiriladi)
	async confirmPayment(memberId: ObjectId, input: ConfirmPaymentInput): Promise<Payment> {
		const { paymentKey, orderId: tossOrderId, mongoOrderId, amount } = input;

		try {
			const order = await this.orderModel.findOne({
				_id: shapeIntoMongoObjectId(mongoOrderId),
				memberId: shapeIntoMongoObjectId(memberId),
			});
			if (!order) throw new NotFoundException('Order not found or does not belong to member');

			if (order.totalAmount !== amount) {
				throw new BadRequestException('Payment amount does not match order total');
			}

			let data: any;
			try {
				const res = await axios.post(
					`${this.TOSS_API_URL}/confirm`,
					{ paymentKey, orderId: tossOrderId, amount },
					{ headers: this.getAuthHeader() },
				);
				data = res.data;
			} catch (err: any) {
				this.logger.error(`Toss confirm error: ${JSON.stringify(err.response?.data ?? err.message)}`);
				throw new BadRequestException(err.response?.data?.message ?? 'Payment confirmation failed');
			}

			const created = await this.paymentModel.create({
				orderId: shapeIntoMongoObjectId(mongoOrderId),
				memberId: shapeIntoMongoObjectId(memberId),
				paymentKey: data.paymentKey,
				tossOrderId: data.orderId,
				amount: data.totalAmount,
				status: data.status === 'DONE' ? PaymentStatus.DONE : PaymentStatus.FAILED,
				method: data.method,
				approvedAt: data.approvedAt,
				rawResponse: data,
			});

			await this.orderModel.updateOne(
				{ _id: shapeIntoMongoObjectId(mongoOrderId) },
				{ $set: { orderStatus: OrderStatus.CONFIRMED } },
			);

			return created;
		} catch (err: any) {
			this.logger.error(`confirmPayment error: ${err.message}`);
			if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
			throw new InternalServerErrorException('Failed to confirm payment');
		}
	}

	// Cancel / refund payment
	async cancelPayment(memberId: ObjectId, input: CancelPaymentInput): Promise<Payment> {
		const { paymentKey, cancelReason, cancelAmount } = input;

		try {
			const existing = await this.paymentModel.findOne({ paymentKey });
			if (!existing) throw new NotFoundException('Payment not found');

			if (existing.memberId.toString() !== shapeIntoMongoObjectId(memberId).toString()) {
				throw new ForbiddenException('Not allowed to cancel this payment');
			}

			let data: any;
			try {
				const body: Record<string, any> = { cancelReason };
				if (cancelAmount) body.cancelAmount = cancelAmount;

				const res = await axios.post(`${this.TOSS_API_URL}/${paymentKey}/cancel`, body, {
					headers: this.getAuthHeader(),
				});
				data = res.data;
			} catch (err: any) {
				this.logger.error(`Toss cancel error: ${JSON.stringify(err.response?.data ?? err.message)}`);
				throw new BadRequestException(err.response?.data?.message ?? 'Payment cancellation failed');
			}

			const isFullyCanceled = data.status === 'CANCELED';

			existing.status = isFullyCanceled ? PaymentStatus.CANCELED : PaymentStatus.PARTIAL_CANCELED;
			existing.canceledAmount = cancelAmount ?? data.totalAmount;
			existing.cancelReason = cancelReason;
			existing.rawResponse = data;
			await existing.save();

			if (isFullyCanceled) {
				await this.orderModel.updateOne({ _id: existing.orderId }, { $set: { orderStatus: OrderStatus.CANCELLED } });
			}

			return existing;
		} catch (err: any) {
			this.logger.error(`cancelPayment error: ${err.message}`);
			if (err instanceof BadRequestException || err instanceof NotFoundException || err instanceof ForbiddenException)
				throw err;
			throw new InternalServerErrorException('Failed to cancel payment');
		}
	}

	// Get payment by Order's Mongo _id
	async getPaymentByOrderId(orderId: string): Promise<Payment> {
		try {
			const payment = await this.paymentModel.findOne({ orderId: shapeIntoMongoObjectId(orderId) });
			if (!payment) throw new NotFoundException('Payment not found for this order');
			return payment;
		} catch (err: any) {
			this.logger.error(`getPaymentByOrderId error: ${err.message}`);
			if (err instanceof NotFoundException) throw err;
			throw new InternalServerErrorException('Failed to fetch payment');
		}
	}
}
