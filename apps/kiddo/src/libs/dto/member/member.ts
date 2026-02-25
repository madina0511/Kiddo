import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MemberAuthType, MemberBrandType, MemberStatus, MemberType } from '../../enums/member.enum';
import type { ObjectId } from 'mongoose';
import { MeLiked } from '../like/like';
import { MeFollowed } from '../follow/follow';

@ObjectType()
export class Member {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => MemberType)
	memberType: MemberType;

	@Field(() => MemberStatus)
	memberStatus: MemberStatus;

	@Field(() => MemberBrandType, { nullable: true })
	memberBrandType?: MemberBrandType;

	@Field(() => MemberAuthType)
	memberAuthType: MemberAuthType;

	@Field(() => String)
	memberPhone: string;

	@Field(() => String)
	memberNick: string;

	memberPassword?: string;

	@Field(() => String, { nullable: true })
	memberFullName?: string;

	@Field(() => String, { nullable: true })
	memberImage?: string;

	@Field(() => String, { nullable: true })
	memberAddress?: string;

	@Field(() => String, { nullable: true })
	memberDesc?: string;

	@Field(() => Int, { nullable: true })
	memberProducts?: number;

	@Field(() => Int, { nullable: true })
	memberArticles?: number;

	@Field(() => Int, { nullable: true })
	memberFollowers?: number;

	@Field(() => Int, { nullable: true })
	memberFollowings?: number;

	@Field(() => Int, { nullable: true })
	memberLikes?: number;

	@Field(() => Int, { nullable: true })
	memberPoints?: number;

	@Field(() => Int, { nullable: true })
	memberViews?: number;

	@Field(() => Int, { nullable: true })
	memberComments?: number;

	@Field(() => Int, { nullable: true })
	memberRank?: number;

	@Field(() => Int, { nullable: true })
	memberWarnings?: number;

	@Field(() => Int, { nullable: true })
	memberBlocks?: number;

	@Field(() => Date, { nullable: true })
	createdAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	updatedAt?: Date;

	@Field(() => String, { nullable: true })
	accessToken?: string;

	/** from Aggregation **/
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

	@Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];
}

@ObjectType()
export class TotalCounter {
	@Field(() => Int, { nullable: true })
	total: number;
}

@ObjectType()
export class Members {
	@Field(() => [Member])
	list: Member[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
