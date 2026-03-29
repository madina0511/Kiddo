import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CartItem {
	@Field(() => String)
	_id: string;

	@Field(() => String)
	productId: string;

	@Field(() => String)
	productTitle: string;

	@Field(() => Float)
	productPrice: number;

	@Field(() => [String])
	productImages: string[];

	@Field(() => [String], { nullable: true })
	size?: string[];

	@Field(() => Int)
	quantity: number;
}

@ObjectType()
export class Cart {
	@Field(() => String)
	_id: string;

	@Field(() => String)
	memberId: string;

	@Field(() => [CartItem])
	items: CartItem[];

	@Field(() => Float)
	totalAmount: number;

	@Field(() => Date, { nullable: true })
	createdAt: Date;

	@Field(() => Date, { nullable: true })
	updatedAt: Date;
}
