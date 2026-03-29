import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

@InputType()
export class UpdateCartItemInput {
	@IsString()
	@IsNotEmpty()
	@Field(() => String)
	_id: string;

	@IsNumber()
	@Min(1)
	@Field(() => Int)
	quantity: number;
}

@InputType()
export class RemoveCartItemInput {
	@IsString()
	@IsNotEmpty()
	@Field(() => String)
	_id: string;
}
