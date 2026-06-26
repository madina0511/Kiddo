import { Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class AiResolver {
	constructor(private readonly aiService: AiService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => String)
	async seedFaq(): Promise<string> {
		const faqs = [
			{
				content: "Kiddo is a children's clothing platform offering quality clothes for kids aged 0-12 years.",
				metadata: { question: 'What is Kiddo?' },
			},
			{
				content:
					'To place an order, select a product, add it to your cart, and complete the payment via Toss Payments.',
				metadata: { question: 'How do I place an order?' },
			},
			{
				content: 'Delivery takes 2-3 business days. Free shipping on orders over 50,000 KRW.',
				metadata: { question: 'How long does delivery take?' },
			},
			{
				content:
					'You can return items within 7 days of receiving them. Items must be unused and in original packaging.',
				metadata: { question: 'What is the return policy?' },
			},
			{
				content:
					"Use our Size Guide based on your child's age, height and weight. A size chart is available on each product page.",
				metadata: { question: 'How do I choose the right size?' },
			},
			{
				content: 'We accept card payments, Kakao Pay, and Naver Pay through Toss Payments.',
				metadata: { question: 'What payment methods are available?' },
			},
			{
				content: 'You can contact our customer service at kiddo@support.com for any inquiries.',
				metadata: { question: 'How do I contact customer support?' },
			},
		];

		for (const faq of faqs) {
			await this.aiService.createEmbedding(faq.content, 'faq', faq.metadata);
		}

		return `${faqs.length} FAQs seeded successfully`;
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => String)
	async seedProducts(): Promise<string> {
		const products = await this.aiService.getProductsForSeed();
		for (const product of products) {
			await this.aiService.createEmbedding(product.content, 'products', product.metadata);
		}
		return `${products.length} products seeded successfully`;
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => String)
	async seedOrders(): Promise<string> {
		const orders = await this.aiService.getOrdersForSeed();
		for (const order of orders) {
			await this.aiService.createEmbedding(order.content, 'orders', order.metadata, order.userId);
		}
		return `${orders.length} orders seeded successfully`;
	}
}
