# Kiddo Backend — Claude Instructions

## Project Overview

Kiddo is a children's fashion e-commerce platform (Korean market).

- Stack: NestJS + MongoDB + GraphQL (monorepo)
- Structure: apps/kiddo/src/components/

## Monorepo Structure

apps/
kiddo/src/
components/ ← all modules here
database/
libs/ ← shared enums, DTOs, guards, interceptors
schemas/ ← MongoDB models
socket/

## Code Style Rules

- Business logic ONLY in service layer
- Use Logger (NestJS) instead of console.log
- Follow existing GraphQL resolver pattern (no REST unless needed)
- Use existing AuthGuard, RoleGuard patterns
- Use shapeIntoMongoObjectId() from libs/config.ts for ObjectId conversion
- Follow existing aggregation pipeline pattern (lookupMember, etc.)

## Current Task: AI Customer Support Assistant

File: src/components/ai/

### Goals

Build a powerful AI assistant that handles:

1. **Order intent** — "내 주문 어디있어?" → find order by memberId, return status
2. **Product search** — "파란색 3살 옷 있어?" → search products by filters
3. **FAQ/Policy** — "반품 어떻게 해?" → query notices (FAQ/TERMS)
4. **General chat** — fallback to LLM response

### Tech Stack for AI Module

- LangChain.js + OpenRouter (LLM)
- MongoDB Atlas Vector Search (RAG for FAQ/notices)
- Intent detection → route to correct handler
- Inject: OrderModel, ProductModel, NoticeModel, MemberModel

### Key Schemas to Use

- Order: memberId, orderNumber, orderStatus, items[], totalAmount
- Product: productTitle, productCategory, productType, productPrice,
  productColors[], size[], ageGroup[], gender
- Notice: noticeCategory (FAQ/TERMS/INQUIRY), noticeTitle, noticeContent
- Member: identity context

### Existing Enums (from libs/enums/)

- OrderStatus: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- ProductType: 20 clothing types
- AgeGroup: 14 ranges
- ClothingSize: 86→176cm
- NoticeCategory: FAQ, TERMS, INQUIRY

### Known Bug (DO NOT fix unless asked)

createOrder spreads input wrongly — don't touch order.service.ts

## Implementation Steps

1. Install dependencies: langchain, @langchain/openai, @langchain/mongodb
2. Create ai.service.ts with intent detection
3. Create vector store for notices/FAQ
4. Connect to existing models via injection
5. Create ai.resolver.ts with GraphQL mutation: askAssistant(question, memberId)
6. Register in ai.module.ts and components.module.ts

## Before Any Change

1. Read existing file before editing
2. Never break existing modules
3. Confirm plan before writing code
4. One step at a time
