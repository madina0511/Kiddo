import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './libs/interceptor/logging.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';
import { WsAdapter } from '@nestjs/platform-ws';
async function bootstrap() {
	const app = await NestFactory.create(AppModule); // app = express + nestjs
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalInterceptors(new LoggingInterceptor());
	app.enableCors({ origin: true, credentials: true }); // origin: ['https://nestar.uz', 'https://admin.nestar.uz']
	// credentials:true =>cookie session ga access berish
	app.use(graphqlUploadExpress({ maxFileSize: 20 * 1024 * 1024, maxFiles: 10 }));
	app.use('/uploads', express.static('./uploads'));
	app.useWebSocketAdapter(new WsAdapter(app)); // websocket connetion
	await app.listen(process.env.PORT_KIDDO ?? 3007);
}
bootstrap();
