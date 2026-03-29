import { Schema } from 'mongoose';

const CartItemSchema = new Schema(
	{
		productId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Product',
		},

		productTitle: {
			type: String,
		},

		productPrice: {
			type: Number,
		},

		productImages: {
			type: [String],
			default: [],
		},

		size: {
			type: [String],
		},

		quantity: {
			type: Number,
			required: true,
			min: 1,
			default: 1,
		},
	},
	{ _id: true },
);

const CartSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
			unique: true,
		},

		items: {
			type: [CartItemSchema],
			default: [],
		},

		totalAmount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true, collection: 'carts' },
);

export default CartSchema;
