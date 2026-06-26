import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'embedding_docs' })
export class EmbeddingDoc extends Document {
	@Prop({ required: true })
	content: string; // asl matn

	@Prop({ required: true, enum: ['faq', 'products', 'orders'] })
	type: string; // ma'lumot turi

	@Prop({ type: Object })
	metadata: Record<string, any>; // qo'shimcha ma'lumot

	@Prop({ type: [Number] })
	embedding: number[]; // vector

	@Prop()
	userId?: string; // order uchun
}

export const EmbeddingDocSchema = SchemaFactory.createForClass(EmbeddingDoc);
