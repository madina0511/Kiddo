import { Schema } from 'mongoose';

const PaymentSchema = new Schema(
	{
		orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
		memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
		paymentKey: { type: String, required: true, unique: true },
		tossOrderId: { type: String, required: true, unique: true },
		amount: { type: Number, required: true },
		status: {
			type: String,
			enum: ['READY', 'DONE', 'CANCELED', 'PARTIAL_CANCELED', 'FAILED'],
			default: 'READY',
		},
		method: { type: String },
		approvedAt: { type: Date },
		canceledAmount: { type: Number },
		cancelReason: { type: String },
		rawResponse: { type: Object },
	},
	{ timestamps: true, collection: 'payments' },
);

export default PaymentSchema;
