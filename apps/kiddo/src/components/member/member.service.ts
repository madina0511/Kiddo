import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { Model, ObjectId } from 'mongoose';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { AuthService } from '../auth/auth.service';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { StatisticModifier, T } from '../../libs/types/common';
import { Follower, Following, MeFollowed } from '../../libs/dto/follow/follow';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import { lookupAuthMemberLiked } from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { GoogleAuthService } from '../auth/google-auth.service';
import { MemberAuthType } from '../../libs/enums/member.enum';
import { GoogleLoginInput } from '../../libs/dto/member/member.input';
import * as crypto from 'crypto';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		private readonly authService: AuthService,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
		private readonly googleAuthService: GoogleAuthService,
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		input.memberPassword = await this.authService.hasPassword(input.memberPassword);

		try {
			const result = await this.memberModel.create(input);

			result.accessToken = await this.authService.createToken(result);

			return result;
		} catch (err) {
			console.log('Error ServiceModel:', err);
			throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		const { memberNick, memberPassword } = input;
		const response = await this.memberModel.findOne({ memberNick: memberNick }).select('+memberPassword').exec();

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}
		//  Compare Password

		const isMatch = await this.authService.comparePassword(memberPassword, response.memberPassword);
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);
		response.accessToken = await this.authService.createToken(response);

		return response;
	}

	public async googleLogin(input: GoogleLoginInput): Promise<Member> {
		const googleUser = await this.googleAuthService.verifyIdToken(input.idToken);

		if (!googleUser.emailVerified) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
		}

		let member = await this.memberModel.findOne({ memberEmail: googleUser.email }).exec();

		if (member) {
			if (member.memberStatus === MemberStatus.DELETE) {
				throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
			} else if (member.memberStatus === MemberStatus.BLOCK) {
				throw new InternalServerErrorException(Message.BLOCKED_USER);
			}
		} else {
			const randomPassword = crypto.randomBytes(16).toString('hex');

			try {
				member = await this.memberModel.create({
					memberNick: this.generateNickFromEmail(googleUser.email),
					memberPassword: await this.authService.hasPassword(randomPassword),
					memberPhone: `google_${googleUser.googleId}`.slice(0, 20),
					memberEmail: googleUser.email,
					memberGoogleId: googleUser.googleId,
					memberAuthType: MemberAuthType.GOOGLE,
					memberImage: googleUser.picture,
					memberFullName: googleUser.name,
				});
			} catch (err) {
				console.log('Error Google Signup:', err);
				throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
			}
		}

		member.accessToken = await this.authService.createToken(member);
		return member;
	}

	private generateNickFromEmail(email: string): string {
		const base = email
			.split('@')[0]
			.replace(/[^a-zA-Z0-9]/g, '')
			.slice(0, 8);
		const suffix = crypto.randomBytes(2).toString('hex');
		return `${base}${suffix}`.slice(0, 12);
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		const result: Member = await this.memberModel
			.findOneAndUpdate(
				{
					_id: memberId,
					memberStatus: MemberStatus.ACTIVE,
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPLOAD_FAILED);
		result.accessToken = await this.authService.createToken(result);
		return result;
	}
	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};

		const targetMember = await this.memberModel.findOne(search).lean().exec();

		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			// record view
			const viewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER };
			const newView = await this.viewService.recordView(viewInput);
			// increase memberview
			if (newView) {
				await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
				targetMember.memberViews++;
			}
		}
		// meLiked
		const likeInput = { memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER };

		targetMember.meLiked = await this.likeService.checkLikeExistence(likeInput);

		// meFollowed
		targetMember.meFollowed = await this.checkSubscription(memberId, targetId);
		return targetMember;
	}
	private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]> {
		const result = await this.followModel.findOne({ followingId: followingId, followerId: followerId }).exec();

		return result ? [{ followerId: followerId, followingId: followingId, myFollowing: true }] : [];
	}
	public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
		const { _id, targetKey, modifier } = input;
		console.log('executed');
		return await this.memberModel.findOneAndUpdate({ _id }, { $inc: { [targetKey]: modifier } }, { new: true }).exec();
	}

	public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members> {
		const { text } = input.search,
			match: T = { memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE },
			sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; // createdAt : -1,

		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
		console.log('match:', match);
		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId, '$_id'),
						],

						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member> {
		const target: Member = await this.memberModel.findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE }).exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.MEMBER,
		};

		// LIKE TOGGLE via like modules

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.memberStatsEditor({
			_id: likeRefId,
			targetKey: 'memberLikes',
			modifier: modifier,
		});

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}
	//ADMIN
	public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
		const { text, memberType, memberStatus } = input.search,
			match: T = {},
			sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; // createdAt : -1,
		if (memberStatus) match.memberStatus = memberStatus;
		if (memberType) match.memberType = memberType;
		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
		console.log('match:', match);

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
		const result: Member = await this.memberModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}
}
