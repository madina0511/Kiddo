import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
	getRequestResponse(context: ExecutionContext) {
		const ctx = GqlExecutionContext.create(context);
		return {
			req: ctx.getContext().req,
			res: ctx.getContext().res,
		};
	}
}
