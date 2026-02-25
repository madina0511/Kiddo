import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { stringify } from 'node:querystring';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// class + class = extends
// class + interface = implements
// interface + interface = extends

@Injectable() // implements => : typeni orniga classga type berish
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger();

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const recordTime = Date.now();
		const requestType = context.getType<GqlContextType>();

		if (requestType === 'http') {
			/*Develop if needed */
			return next.handle().pipe(
				tap(() => {
					const responseTime = Date.now() - recordTime;
					this.logger.verbose(`${responseTime}ms`, 'HTTP RESPONSE');
				}),
			);
		} else if (requestType === 'graphql') {
			/* (1) Print Request */
			const gqlContext = GqlExecutionContext.create(context);

			this.logger.verbose(` ${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');

			/*(2) Errors handling via GraphQL */

			/*(3) No Errors, giving Response below */
			return next.handle().pipe(
				tap((context) => {
					const responsetime = Date.now() - recordTime;
					this.logger.verbose(`${this.stringify(context)}-${responsetime}ms \n\n`, 'RESPONSE');
				}),
			);
		}
		// Fallback (har ehtimolga qarshi)
		return next.handle();
	}

	private stringify(context: ExecutionContext): string {
		console.log(typeof context);
		return JSON.stringify(context).slice(0, 76);
	}
}
