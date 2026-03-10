import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';

import type { ObjectId } from 'mongoose';
import { ProductCategory, ProductColor, ProductStatus, ProductType } from '../../enums/product.enum';

@InputType()
export class ProductUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => ProductType, { nullable: true })
	productType?: ProductType;

	@IsOptional()
	@Field(() => ProductStatus, { nullable: true })
	productStatus?: ProductStatus;

	@IsOptional()
	@Field(() => ProductCategory, { nullable: true })
	productCategory?: ProductCategory;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	productTitle?: string;
	@IsOptional()
	@Field(() => [ProductColor], { nullable: true })
	productColors?: ProductColor[];

	@IsOptional()
	@Length(3, 100)
	@Field(() => String)
	brandName: string;

	@IsOptional()
	@Min(0)
	@Field(() => Number, { nullable: true })
	productPrice?: number;

	@IsOptional()
	@Min(0)
	@Field(() => Number, { nullable: true })
	productDiscount?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	productImages?: string[];
	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	productDesc?: string;

	soldAt?: Date;

	deletedAt?: Date;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}
