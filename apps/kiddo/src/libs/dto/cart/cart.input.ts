import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

@InputType()
export class CartItemInput {
	@IsString()
	@IsNotEmpty()
	@Field(() => String)
	productId: string;

	@IsArray()
	@IsString({ each: true })
	@Field(() => [String], { nullable: true })
	size?: string[];

	@IsNumber()
	@Min(1)
	@Field(() => Int, { nullable: true })
	quantity?: number;
}
