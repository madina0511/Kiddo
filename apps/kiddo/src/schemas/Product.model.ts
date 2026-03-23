import { Schema } from 'mongoose';

import {
	AgeGroup,
	ClothingSize,
	Gender,
	ProductCategory,
	ProductColor,
	ProductStatus,
	ProductType,
} from '../libs/enums/product.enum';

const ProductSchema = new Schema(
	{
		productType: {
			type: String,
			enum: ProductType,
			required: true,
		},
		setItems: {
			type: [Schema.Types.ObjectId],
			ref: 'Product',
			default: [],
		},
		productCategory: {
			type: String,
			enum: ProductCategory,
		},
		brandName: {
			type: String,
			required: false,
			trim: true,
		},

		productStatus: {
			type: String,
			enum: ProductStatus,
			default: ProductStatus.ACTIVE,
		},

		ageGroup: {
			type: [String],
			enum: AgeGroup,
		},
		size: {
			type: [String],
			enum: ClothingSize,
		},

		gender: {
			type: String,
			enum: Gender,
		},

		productTitle: {
			type: String,
			required: true,
			trim: true,
		},
		productViews: {
			type: Number,
			default: 0,
		},

		productPrice: {
			type: Number,
			required: true,
		},
		productDiscount: {
			type: Number,
			default: 0,
		},

		productLikes: {
			type: Number,
			default: 0,
		},

		productComments: {
			type: Number,
			default: 0,
		},

		productRank: {
			type: Number,
			default: 0,
		},

		productImages: {
			type: [String],
			required: true,
		},

		productDesc: {
			type: String,
			trim: true,
		},
		productColors: {
			type: [String],
			enum: ProductColor,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		constructedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'products' },
);

ProductSchema.index({ productType: 1, productTitle: 1, productPrice: 1, memberId: 1 }, { unique: true });

export default ProductSchema;
