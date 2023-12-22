import * as trpcNext from '@trpc/server/adapters/next';
import { createContext } from '@/server/context';
import { AppRouter, appRouter } from '@/server/routers/_app';

export default trpcNext.createNextApiHandler<AppRouter>({
	router: appRouter,
	createContext,
	onError({ error }) {
		if (error.code === 'INTERNAL_SERVER_ERROR') {
			console.error('Something went wrong', error);
		}
	},
	batching: {
		enabled: true,
	},
});
