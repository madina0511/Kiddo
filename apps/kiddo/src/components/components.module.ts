import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { FollowModule } from './follow/follow.module';
import { CommentModule } from './comment/comment.module';
import { ViewModule } from './view/view.module';
import { LikeModule } from './like/like.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { AiModule } from './ai/ai.module';

@Module({
	imports: [
		MemberModule,
		ProductModule,
		AuthModule,
		FollowModule,
		CommentModule,
		ViewModule,
		LikeModule,
		BoardArticleModule,
		OrderModule,
		CartModule,
		AiModule,
	],
})
export class ComponentsModule {}
