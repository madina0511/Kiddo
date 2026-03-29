import { Schema } from 'mongoose';
import { ObjectId } from 'mongoose';
import { OrderStatus } from '../libs/enums/order.enum';

const OrderItemSchema = new Schema({
	productId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Product',
	},
	productName: {
		type: String,
		required: true,
	},
	productImages: {
		type: String,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	price: {
		type: Number,
		required: true,
		min: 0,
	},
});

const OrderSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
		orderNumber: {
			type: String,
			required: true,
			unique: true,
		},
		items: {
			type: [OrderItemSchema],
			required: true,
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		orderStatus: {
			type: String,
			enum: OrderStatus,
			default: OrderStatus.PENDING,
		},
	},
	{ timestamps: true, collection: 'orders' },
);

OrderSchema.index({ memberId: 1, createdAt: -1 });

export default OrderSchema;
