import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { ViewService } from '../view/view.service';
import { InjectModel } from '@nestjs/mongoose';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import moment from 'moment';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Product, Products } from '../../libs/dto/product/product';
import { ProductStatus, ProductType } from '../../libs/enums/product.enum';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import {
	AgentProductsInquiry,
	AllProductsInquiry,
	OrdinaryInquiry,
	ProductInput,
	ProductsInquiry,
} from '../../libs/dto/product/product.input';

@Injectable()
export class ProductService {
	constructor(
		@InjectModel('Product') private readonly productModel: Model<Product>,
		private readonly memberService: MemberService,
		private readonly authService: AuthService,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
	) {}
	public async createProduct(input: ProductInput): Promise<Product> {
		try {
			console.log('executed');
			const result = await this.productModel.create(input);

			if (!result) {
				throw new BadRequestException(Message.CREATE_FAILED);
			}
			// Increase memberProperties
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProducts',
				modifier: 1,
			});

			return result;
		} catch (err) {
			console.log('Error ServiceModel:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getProduct(memberId: ObjectId, productId: ObjectId): Promise<Product> {
		const search: T = {
			_id: productId,
			productStatus: ProductStatus.ACTIVE,
		};
		let targetProduct: Product = await this.productModel.findOne(search).lean().exec();
		if (!targetProduct) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		if (memberId) {
			const viewInput = { memberId, viewRefId: productId, viewGroup: ViewGroup.PRODUCT };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.productStatsEditor({ _id: productId, targetKey: 'productViews', modifier: 1 });
				targetProduct.productViews++;
			}
			// meLiked
			const likeInput = { memberId: memberId, likeRefId: productId, likeGroup: LikeGroup.PRODUCT };

			targetProduct.meLiked = await this.likeService.checkLikeExistence(likeInput);
			targetProduct.memberData = await this.memberService.getMember(null, targetProduct.memberId);
		}

		return targetProduct;
	}

	public async updateProduct(memberId: ObjectId, input: ProductUpdate): Promise<Product> {
		let { productStatus, soldAt, deletedAt } = input;

		const search = {
			_id: input._id,
			memberId: memberId,
			productStatus: ProductStatus.ACTIVE,
		};

		if (productStatus === ProductStatus.SOLD) soldAt = moment().toDate();
		else if (productStatus === ProductStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.productModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberProducts',
				modifier: -1,
			});
		}

		return result;
	}

	public async getProducts(memberId: ObjectId, input: ProductsInquiry): Promise<Products> {
		const match: T = { productStatus: ProductStatus.ACTIVE };
		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);
		console.log('match: ', match);

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId),
							lookupMember,
							{ $unwind: '$memberData' }, // [memberData]=> memberData
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	private shapeMatchQuery(match: T, input: ProductsInquiry): void {
		// input.search ichidan kerakli filter field’larni ajratib olyapmiz
		const search = input.search ?? {};
		const {
			memberId,
			genderList,
			ageGroup,
			productType,
			categoryList,
			size,
			productColors,
			setItems,
			pricesRange,
			text,
		} = input.search;

		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (productType && productType.length) {
			match.productType = { $in: productType };
		} else {
			match.productType = { $ne: ProductType.SET };
		}
		if (productType && productType.length) match.productType = { $in: productType };
		if (categoryList && categoryList.length) match.productCategory = { $in: categoryList };
		if (genderList && genderList.length) match.gender = { $in: genderList };
		if (ageGroup && ageGroup.length) match.ageGroup = { $in: ageGroup };
		if (size && size.length) match.size = { $in: size };
		if (productColors && productColors.length) match.productColors = { $in: productColors };
		if (pricesRange) match.productPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		if (text) match.productTitle = { $regex: new RegExp(text, 'i') };
		if (setItems && setItems.length) match.setItems = { $in: setItems };
	}
	public async getFavorities(memberId: ObjectId, input: OrdinaryInquiry): Promise<Products> {
		return await this.likeService.getFavoriteProducts(memberId, input);
	}
	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Products> {
		return await this.viewService.getVisitedProducts(memberId, input);
	}
	public async getAgentProducts(memberId: ObjectId, input: AgentProductsInquiry): Promise<Products> {
		const { productStatus } = input.search;

		// agar agent DELETE statusdagi propertylarni so‘rasa — ruxsat berilmaydi
		if (productStatus === ProductStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

		// MongoDB match sharti
		const match: T = {
			memberId: memberId, // faqat shu agentga tegishli propertylar
			productStatus: productStatus ?? { $ne: ProductStatus.DELETE },
			// agar status berilmagan bo‘lsa — DELETE bo‘lmaganlarini oladi
		};

		// sort obyekt (qaysi field + qaysi yo‘nalishda)
		const sort: T = {
			// sort field (default: createdAt)
			[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC, // sort direction (default: DESC)
		};

		// MongoDB aggregate pipeline
		const result = await this.productModel
			.aggregate([
				{ $match: match }, // filterlar qo‘llanadi
				{ $sort: sort }, // sort qilinadi
				{
					$facet: {
						// pagination qilingan propertylar ro‘yxati
						list: [
							{ $skip: (input.page - 1) * input.limit }, // qaysi sahifadan boshlash
							{ $limit: input.limit }, // nechta element olish
							lookupMember, // member ma’lumotlarini qo‘shish
							{ $unwind: '$memberData' }, // memberData arrayni tashab → object
						],
						// umumiy sonini hisoblash
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec(); // aggregation’ni ishga tushirish

		// agar hech qanday natija topilmasa — error
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		// natijaning birinchi elementi (facet natijasi) qaytariladi
		return result[0];
	}

	public async likeTargetProduct(memberId: ObjectId, likeRefId: ObjectId): Promise<Product> {
		const target: Product = await this.productModel
			.findOne({ _id: likeRefId, productStatus: ProductStatus.ACTIVE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.PRODUCT,
		};

		// LIKE TOGGLE via like modules

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.productStatsEditor({
			_id: likeRefId,
			targetKey: 'productLikes',
			modifier: modifier,
		});

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	/**  ADMIN  **/
	public async getAllProductsByAdmin(input: AllProductsInquiry): Promise<Products> {
		const { productStatus } = input.search;

		const match: T = {};

		const sort: T = {
			[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
		};

		if (productStatus) match.productStatus = productStatus;

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember, // [memberData]
							{ $unwind: '$memberData' }, // unwind tufayli: memberData
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
	public async updateProductsByAdmin(input: ProductUpdate): Promise<Product> {
		let { productStatus, soldAt, deletedAt } = input;

		const search: T = {
			_id: input._id,
			productStatus: ProductStatus.ACTIVE,
		};

		if (productStatus === ProductStatus.SOLD) soldAt = moment().toDate();
		else if (productStatus === ProductStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.productModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProducts',
				modifier: -1,
			});
		}

		return result;
	}

	public async removeProductByAdmin(productId: ObjectId): Promise<Product> {
		const search: T = {
			_id: productId,
			productStatus: ProductStatus.DELETE,
		};

		const result = await this.productModel.findOneAndDelete(search).exec();

		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async productStatsEditor(input: StatisticModifier): Promise<Product> {
		const { _id, targetKey, modifier } = input;
		const result = await this.productModel
			.findOneAndUpdate({ _id }, { $inc: { [targetKey]: modifier } }, { new: true })
			.exec();
		console.log('product:statistics', result);
		return result;
	}
}
