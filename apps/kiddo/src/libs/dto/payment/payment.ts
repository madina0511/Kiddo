import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum PaymentStatus {
	READY = 'READY',
	DONE = 'DONE',
	CANCELED = 'CANCELED',
	PARTIAL_CANCELED = 'PARTIAL_CANCELED',
	FAILED = 'FAILED',
}
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

@ObjectType()
export class Payment {
	@Field(() => String)
	_id: string;

	@Field(() => String)
	orderId: string;

	@Field(() => String)
	memberId: string;

	@Field()
	paymentKey: string;

	@Field()
	tossOrderId: string;

	@Field(() => Int)
	amount: number;

	@Field(() => PaymentStatus)
	status: PaymentStatus;

	@Field({ nullable: true })
	method?: string;

	@Field({ nullable: true })
	approvedAt?: Date;

	@Field(() => Int, { nullable: true })
	canceledAmount?: number;

	@Field({ nullable: true })
	cancelReason?: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	rawResponse?: Record<string, any>;
}
