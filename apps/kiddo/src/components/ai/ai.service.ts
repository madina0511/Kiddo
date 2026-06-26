import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { EmbeddingDoc } from './schemas/embedding-doc.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Product } from '../../libs/dto/product/product';
import { MongoClient } from 'mongodb';
import { Order } from '../../libs/dto/order/order';

@Injectable()
export class AiService {
	private readonly logger = new Logger(AiService.name);
	private embeddings: OpenAIEmbeddings;
	private llm: ChatOpenAI;
	private vectorStore: MongoDBAtlasVectorSearch;

	constructor(
		@InjectModel(EmbeddingDoc.name)
		private readonly embeddingDocModel: Model<EmbeddingDoc>,
		@InjectModel('Product')
		private readonly productModel: Model<Product>,
		@InjectModel('Order')
		private readonly orderModel: Model<Order>,
		private readonly configService: ConfigService,
		@InjectConnection() private readonly connection: Connection,
	) {
		const openAiConfig = {
			apiKey: this.configService.get<string>('OPENROUTER_API_KEY'),
			configuration: {
				baseURL: this.configService.get<string>('OPENAI_BASE_URL'),
			},
		};

		this.embeddings = new OpenAIEmbeddings({
			...openAiConfig,
			model: 'text-embedding-3-small',
		});

		this.llm = new ChatOpenAI({
			...openAiConfig,
			model: this.configService.get<string>('OPENAI_MODEL'),
			streaming: true,
		});
	}

	async onModuleInit() {
		if (this.connection.readyState === 1) {
			// allaqachon connected
			await this.initVectorStore();
		} else {
			this.connection.once('open', () => {
				this.initVectorStore();
			});
		}
	}

	private async initVectorStore(): Promise<void> {
		const mongoUri = this.configService.get<string>('MONGO_DEV');
		const client = new MongoClient(mongoUri);
		await client.connect();

		const db = client.db('Kiddo');
		const collection = db.collection('embedding_docs');

		this.vectorStore = new MongoDBAtlasVectorSearch(this.embeddings, {
			collection,
			indexName: 'vector_index',
			textKey: 'content',
			embeddingKey: 'embedding',
		});

		this.logger.log('AI VectorStore initialized');
	}
	// FAQ va Product ma'lumotlarini RAG orqali qidirish
	async search(query: string, userId?: string): Promise<string> {
		const filter: Record<string, any> = {
			type: { $in: ['faq', 'products'] },
		};

		// Agar login bo'lgan user bo'lsa, orders ham qo'shamiz
		if (userId) {
			filter['$or'] = [{ type: { $in: ['faq', 'products'] } }, { type: 'orders', userId }];
			delete filter.type;
		}

		const retriever = this.vectorStore.asRetriever({
			filter,
			k: 5,
		});

		const prompt = PromptTemplate.fromTemplate(`
You are Kiddo AI Assistant - a friendly and helpful assistant for Kiddo, a children's clothing platform.

You can help with:
1. 👶 Children's clothing advice (sizing, age-appropriate styles, seasonal recommendations)
2. 🛍️ Product recommendations based on age, size, and preferences
3. 📦 Order status and delivery information (only for logged-in users)
4. 🏪 Kiddo store info:
   - Shipping: 2-3 business days, free over 50,000 KRW
   - Returns: 7 days return policy
   - Payment: Toss Payments (card, Kakao Pay, Naver Pay)
   - Customer service: kiddo@support.com
5. 📏 Size guide assistance (help parents find the right size for their child)
6. Do not use markdown formatting, line breaks or special characters in your response. Write in plain text only.

Product catalog:
{context}

Chat history:
{history}

User question: {question}

Rules:
- Answer in the same language as the user's question.
  If the question is in English, answer in English.
  If the question is in Korean (한국어), answer in Korean.
  If the question is in Uzbek, answer in Uzbek.
- Be friendly and warm (remember you're helping parents shop for their children)
- If order information is requested and user is not logged in, ask them to log in first
- Keep answers concise but helpful
`);

		const chain = RunnableSequence.from([
			{
				context: async (input: { query: string; history: string }) => {
					const docs = await retriever.invoke(input.query);
					return docs.map((d) => d.pageContent).join('\n\n');
				},
				question: (input: { query: string; history: string }) => input.query,
				history: (input: { query: string; history: string }) => input.history,
			},
			prompt,
			this.llm,
			new StringOutputParser(),
		]);

		return chain.invoke({ query, history: '' });
	}

	// Streaming uchun
	async streamChat(query: string, onChunk: (chunk: string) => void, userId?: string): Promise<void> {
		const answer = await this.search(query, userId);
		// chunk bo'lib yuborish
		const words = answer.split(' ');
		for (const word of words) {
			onChunk(word + ' ');
			await new Promise((r) => setTimeout(r, 30));
		}
	}

	// Seed: embedding yaratish
	async createEmbedding(
		content: string,
		type: 'faq' | 'products' | 'orders',
		metadata: Record<string, any> = {},
		userId?: string,
	): Promise<void> {
		const vector = await this.embeddings.embedQuery(content);

		await this.embeddingDocModel.create({
			content,
			type,
			metadata,
			embedding: vector,
			userId,
		});

		this.logger.log(`Embedding created: ${type}`);
	}
	async getProductsForSeed(): Promise<{ content: string; metadata: Record<string, any> }[]> {
		const products = await this.productModel.find({ productStatus: 'ACTIVE' }).lean();

		return products.map((p) => ({
			content: `Product: ${p.productTitle}. Brand: ${p.brandName}. Category: ${p.productCategory}. Price: ${p.productPrice} KRW. Gender: ${p.gender}. Age group: ${p.ageGroup?.join(', ')}. Sizes: ${p.size?.join(', ')}. Colors: ${p.productColors?.join(', ')}. Description: ${p.productDesc ?? 'No description'}`,
			metadata: {
				productId: p._id.toString(),
				productTitle: p.productTitle,
				productPrice: p.productPrice,
				brandName: p.brandName,
				productCategory: p.productCategory,
			},
		}));
	}
	async getOrdersForSeed(): Promise<{ content: string; metadata: Record<string, any>; userId: string }[]> {
		const orders = await this.orderModel.find().lean();

		return orders.map((o) => ({
			content: `Order #${o.orderNumber}. Status: ${o.orderStatus}. Total: ${o.totalAmount} KRW. Items: ${o.items?.map((i: any) => `${i.productName} x${i.quantity}`).join(', ')}. Delivery to: ${o.address?.address}, ${o.address?.recipientName}.`,
			metadata: {
				orderId: o._id.toString(),
				orderNumber: o.orderNumber,
				orderStatus: o.orderStatus,
				totalAmount: o.totalAmount,
			},
			userId: o.memberId.toString(),
		}));
	}
}
