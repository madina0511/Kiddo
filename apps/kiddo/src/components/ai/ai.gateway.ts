import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { AiService } from './ai.service';
import { AuthService } from '../auth/auth.service';
import * as url from 'url';

interface AiChatPayload {
	message: string;
}

@WebSocketGateway({
	path: '/ai-ws',
})
export class AiGateway implements OnGatewayInit {
	private readonly logger = new Logger(AiGateway.name);

	@WebSocketServer()
	server: Server;

	constructor(
		private readonly aiService: AiService,
		private readonly authService: AuthService,
	) {}

	afterInit() {
		this.logger.verbose('AI WebSocket Gateway Initialized');
	}

	private async retrieveAuth(req: any): Promise<string | undefined> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			if (!token) return undefined;
			const member = await this.authService.verifyToken(token as string);
			return member?._id?.toString();
		} catch {
			return undefined;
		}
	}

	@SubscribeMessage('aiChat')
	public async handleAiChat(client: WebSocket, payload: string): Promise<void> {
		let message: string;
		let userId: string | undefined;

		try {
			const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
			message = parsed.message;
			userId = parsed.userId;
		} catch {
			message = payload as unknown as string;
		}

		client.send(JSON.stringify({ event: 'ai:start' }));

		try {
			await this.aiService.streamChat(
				message,
				(chunk: string) => {
					client.send(JSON.stringify({ event: 'ai:chunk', chunk }));
				},
				userId,
			);

			client.send(JSON.stringify({ event: 'ai:end' }));
		} catch (error) {
			this.logger.error('AI Chat error:', error);
			client.send(JSON.stringify({ event: 'ai:error', message: 'Something went wrong' }));
		}
	}
}
