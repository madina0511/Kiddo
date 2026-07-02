import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleUserPayload {
	email: string;
	emailVerified: boolean;
	name: string;
	picture?: string;
	googleId: string;
}

@Injectable()
export class GoogleAuthService {
	private readonly logger = new Logger(GoogleAuthService.name);
	private readonly client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

	public async verifyIdToken(idToken: string): Promise<GoogleUserPayload> {
		try {
			const ticket = await this.client.verifyIdToken({
				idToken,
				audience: process.env.GOOGLE_CLIENT_ID,
			});

			const payload = ticket.getPayload();

			if (!payload || !payload.email) {
				throw new UnauthorizedException('Invalid Google token payload');
			}

			return {
				email: payload.email,
				emailVerified: payload.email_verified ?? false,
				name: payload.name ?? '',
				picture: payload.picture,
				googleId: payload.sub,
			};
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			this.logger.error(`Google token verification failed: ${message}`);
			throw new UnauthorizedException('Invalid Google token');
		}
	}
}
