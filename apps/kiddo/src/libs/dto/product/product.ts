import { Field, Int, ObjectType } from '@nestjs/graphql';

import type { ObjectId } from 'mongoose';

import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';
import { AgeGroup, ClothingSize, Gender, ProductCategory, ProductStatus, ProductType } from '../../enums/product.enum';

@ObjectType()
export class Product {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => ProductType)
	productType: ProductType;

	@Field(() => [String], { nullable: true })
	setItems?: string[];

	@Field(() => [String], { nullable: true })
	productColors?: string[];

	@Field(() => ProductStatus)
	productStatus: ProductStatus;

	@Field(() => ProductCategory)
	productCategory: ProductCategory;

	@Field(() => [AgeGroup])
	ageGroup: AgeGroup[];

	@Field(() => [ClothingSize])
	size: ClothingSize[];

	@Field(() => String)
	productTitle: string;

	@Field(() => String)
	brandName: string;

	@Field(() => Number)
	productPrice: number;

	@Field(() => Gender)
	gender: Gender;

	@Field(() => Number, { nullable: true })
	productDiscount?: number;

	@Field(() => Int)
	productViews: number;

	@Field(() => Int)
	productLikes: number;

	@Field(() => Int)
	productComments: number;

	@Field(() => Int)
	productRank: number;

	@Field(() => [String], { nullable: true })
	productImages?: string[];

	@Field(() => String, { nullable: true })
	productDesc?: string;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	/* from aggregation*/

	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	constructedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
	/** from Aggregation **/
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}

@ObjectType()
export class Products {
	@Field(() => [Product])
	list: Product[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter?: TotalCounter[];
}
