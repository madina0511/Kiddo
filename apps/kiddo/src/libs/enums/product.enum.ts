import { registerEnumType } from '@nestjs/graphql';

export enum ProductType {
	ROMPER = 'ROMPER',
	SLEEPSUIT = 'SLEEPSUIT',
	BODYSUIT = 'BODYSUIT',
	T_SHIRT = 'T_SHIRT',
	BLOUSES = 'BLOUSES',
	TOPS = 'TOPS',
	SHIRTS = 'SHIRTS',
	KNIT = 'KNIT',
	SKIRTS = 'SKIRTS',
	LEGGINGS = 'LEGGINGS',
	JEANS = 'JEANS',
	SHORTS = 'SHORTS',
	PANTS = 'PANTS',
	DRESS = 'DRESS',
	SET = 'SET',
	JACKET = 'JACKET',
	SWEATER = 'SWEATER',
	HOODIE = 'HOODIE',
	PAJAMA = 'PAJAMA',
	UNDERWEAR_NIGHTWEAR = 'UNDERWEAR NIGHTWEAR',
}
registerEnumType(ProductType, {
	name: 'ProductType',
});

export enum ProductCategory {
	ALL = 'ALL',
	INDOORWEAR = 'INDOORWEAR',
	OUTERWEAR = 'OUTERWEAR',
	ACCESSORIES = 'ACCESSORIES',
	SWIMWEAR = 'SWIMWEAR',
	BABY_TODDLER = 'BABY_TODDLER',
}
registerEnumType(ProductCategory, {
	name: 'ProductCategory',
});
export enum ProductColor {
	RED = 'RED',
	BLUE = 'BLUE',
	WHITE = 'WHITE',
	BLACK = 'BLACK',
	PINK = 'PINK',
	GREEN = 'GREEN',
	BEIGE = 'BEIGE',
}
registerEnumType(ProductColor, {
	name: 'ProductColor',
});

export enum ProductStatus {
	SOLD = 'SOLD',
	DELETE = 'DELETE',
	ACTIVE = 'ACTIVE',
}
registerEnumType(ProductStatus, {
	name: 'ProductStatus',
});

export enum AgeGroup {
	ALL = 'ALL',
	M0_3 = 'M0_3',
	M3_6 = 'M3_6',
	M6_12 = 'M6_12',
	M12_18 = 'M12_18',
	M18_24 = 'M18_24',
	Y2_3 = 'Y2_3',
	Y3_4 = 'Y3_4',
	Y5_6 = 'Y5_6',
	Y7_8 = 'Y7_8',
	Y9_10 = 'Y9_10',
	Y11_12 = 'Y11_12',
	Y13_14 = 'Y13_14',
	Y15_16 = 'Y15_16',
	ONE_SIZE = 'ONE_SIZE',
}

registerEnumType(AgeGroup, {
	name: 'AgeGroup',
});
export enum ClothingSize {
	SIZE_86_92 = 'SIZE_86_92',
	SIZE_92_98 = 'SIZE_92_98',
	SIZE_98_104 = 'SIZE_98_104',
	SIZE_110_116 = 'SIZE_110_116',
	SIZE_122_128 = 'SIZE_122_128',
	SIZE_134_140 = 'SIZE_134_140',
	SIZE_146_152 = 'SIZE_146_152',
	SIZE_158_164 = 'SIZE_158_164',
	SIZE_170_176 = 'SIZE_170_176',
}

registerEnumType(ClothingSize, {
	name: 'ClothingSize',
});

export enum Gender {
	ALL = 'ALL',
	BOY = 'BOY',
	GIRL = 'GIRL',
}

registerEnumType(Gender, {
	name: 'Gender',
});
