import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
	@Query(() => String)
	public async intro(): Promise<String> {
		return 'Hello GraphQL';
	}
}
