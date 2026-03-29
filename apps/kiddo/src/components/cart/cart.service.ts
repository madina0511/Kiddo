import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Cart } from '../../libs/dto/cart/cart';
import { CartItemInput } from '../../libs/dto/cart/cart.input';
import { RemoveCartItemInput, UpdateCartItemInput } from '../../libs/dto/cart/cart.update';
import { Product } from '../../libs/dto/product/product';

@Injectable()
export class CartService {
	constructor(
		@InjectModel('Cart') private readonly cartModel: Model<Cart>,
		@InjectModel('Product') private readonly productModel: Model<Product>,
	) {}

	// helper: totalAmount hisoblash
	private calcTotal(items: any[]): number {
		return items.reduce((sum, item) => {
			const price = Number(item.productPrice) || 0;
			const qty = Number(item.quantity) || 0;
			return sum + price * qty;
		}, 0);
	}

	// Cart topish yoki yangi yaratish
	private async findOrCreate(memberId: ObjectId): Promise<any> {
		let cart = await this.cartModel.findOne({ memberId }).exec();
		if (!cart) {
			cart = await this.cartModel.create({
				memberId,
				items: [],
				totalAmount: 0,
			});
		}
		return cart;
	}

	async getMyCart(memberId: ObjectId): Promise<Cart> {
		const cart = await this.findOrCreate(memberId);

		return cart;
	}

	async addToCart(memberId: ObjectId, input: CartItemInput): Promise<Cart> {
		try {
			const cart = await this.findOrCreate(memberId);
			console.log('INPUT:', input); // ← shu logni ko'rsating

			console.log('CART:', cart); // ← va buni
			const product = await this.productModel.findById(input.productId).lean().exec();
			if (!product) throw new NotFoundException('Product not found');

			const existingIndex = cart.items.findIndex((item: any) => item.productId.toString() === input.productId);

			if (existingIndex >= 0) {
				cart.items[existingIndex].quantity += input.quantity;
			} else {
				cart.items.push({
					productId: product._id,
					productTitle: product.productTitle,
					productPrice: product.productPrice,
					productImages: product.productImages,
					quantity: input.quantity,
					size: input.size,
				});
			}

			const plainItems = cart.items.map((item: any) => ({
				productPrice: item.productPrice,
				quantity: item.quantity,
			}));

			cart.totalAmount = plainItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);

			await cart.save();
			return cart;
		} catch (err) {
			console.error('addToCart ERROR:', err.message);
			throw new Error(err.message);
		}
	}

	async removeFromCart(memberId: ObjectId, input: RemoveCartItemInput): Promise<Cart> {
		const cart = await this.cartModel.findOne({ memberId }).exec();
		if (!cart) throw new NotFoundException('Cart not found');

		cart.items = cart.items.filter((item: any) => item._id.toString() !== input._id);

		cart.totalAmount = this.calcTotal(cart.items);
		await cart.save();
		return cart;
	}

	async updateCartItem(memberId: ObjectId, input: UpdateCartItemInput): Promise<Cart> {
		try {
			console.log('UPDATE INPUT:', input);

			const cart = await this.cartModel.findOne({ memberId }).exec();
			if (!cart) throw new NotFoundException('Cart not found');

			const item = cart.items.find((item: any) => item._id.toString() === input._id);
			if (!item) throw new NotFoundException('Cart item not found');

			item.quantity = input.quantity;

			cart.totalAmount = this.calcTotal(cart.items);
			cart.markModified('items');

			await cart.save();

			console.log('UPDATED ITEM:', item);
			console.log('UPDATED CART:', cart);

			return cart;
		} catch (error) {
			console.error('UPDATE CART ITEM ERROR:', error);

			if (error instanceof HttpException) throw error;
			throw new InternalServerErrorException('Failed to update cart item');
		}
	}

	async clearCart(memberId: ObjectId): Promise<Cart> {
		const cart = await this.cartModel.findOne({ memberId }).exec();
		if (!cart) throw new NotFoundException('Cart not found');

		cart.items = [];
		cart.totalAmount = 0;
		await cart.save();
		return cart;
	}
}
