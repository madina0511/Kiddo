import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CartService } from './cart.service';
import { Cart } from '../../libs/dto/cart/cart';
import { CartItemInput } from '../../libs/dto/cart/cart.input';
import { RemoveCartItemInput, UpdateCartItemInput } from '../../libs/dto/cart/cart.update';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class CartResolver {
	constructor(private readonly cartService: CartService) {}

	@UseGuards(AuthGuard)
	@Query(() => Cart)
	async getMyCart(@AuthMember('_id') memberId: ObjectId): Promise<Cart> {
		return await this.cartService.getMyCart(memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Cart)
	async addToCart(@AuthMember('_id') memberId: ObjectId, @Args('input') input: CartItemInput): Promise<Cart> {
		console.log('INPUT:', input); // ← shu logni ko'rsating
		return await this.cartService.addToCart(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Cart)
	async removeFromCart(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: RemoveCartItemInput,
	): Promise<Cart> {
		return await this.cartService.removeFromCart(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Cart)
	async updateCartItem(
		@AuthMember('_id') memberId: ObjectId,
		@Args('input') input: UpdateCartItemInput,
	): Promise<Cart> {
		return await this.cartService.updateCartItem(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Cart)
	async clearCart(@AuthMember('_id') memberId: ObjectId): Promise<Cart> {
		return await this.cartService.clearCart(memberId);
	}
}
