import { registerEnumType } from '@nestjs/graphql';

export enum ProductType {
	ROMPER = 'ROMPER',
	SLEEPSUIT = 'SLEEPSUIT',
	BODYSUIT = 'BODYSUIT',
	T_SHIRT = 'T_SHIRT',
	PANTS = 'PANTS',
	DRESS = 'DRESS',
	SET = 'SET',
	JACKET = 'JACKET',
	SWEATER = 'SWEATER',
	HOODIE = 'HOODIE',
	PAJAMA = 'PAJAMA',
}
registerEnumType(ProductType, {
	name: 'ProductType',
});

export enum ProductCategory {
	INDOORWEAR = 'INDOORWEAR',
	OUTERWEAR = 'OUTERWEAR',
	ACCESSORIES = 'ACCESSORIES',
	SWIMWEAR = 'SWIMWEAR',
	BABY_TODDLER = 'BABY_TODDLER',
}
registerEnumType(ProductCategory, {
	name: 'ProductCategory',
});

export enum ProductStatus {
	IN_STOCK = 'IN STOCK',
	OUT_OF_STOCK = 'OUT OF STOCK',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
	ACTIVE = 'ACTIVE',
}
registerEnumType(ProductStatus, {
	name: 'ProductStatus',
});

export enum BabySize {
	ALL = 'ALL',
	NB = 'NEWBORN', // 0-1 oy
	M3 = '0-3M',
	M6 = '3-6M',
	M9 = '6-9M',
	M12 = '9-12M',
	M18 = '12-18M',
	M24 = '18-24M',
}
registerEnumType(BabySize, {
	name: 'BabySize',
});

export enum Gender {
	ALL = 'ALL',
	BOY = 'BOY',
	GIRL = 'GIRL',
}

registerEnumType(Gender, {
	name: 'Gender',
});
