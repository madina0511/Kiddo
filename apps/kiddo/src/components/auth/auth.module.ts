import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { GoogleAuthService } from './google-auth.service';

@Module({
	imports: [
		HttpModule,
		JwtModule.register({
			secret: `${process.env.SECRET_TOKEN}`,
			signOptions: { expiresIn: '30d' },
		}),
	],
	providers: [AuthService, AuthGuard, GoogleAuthService],
	exports: [AuthService, AuthGuard, GoogleAuthService],
})
export class AuthModule {}
