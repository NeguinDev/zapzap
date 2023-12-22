/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 */

import { Context } from './context';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { prisma } from './prisma';

const t = initTRPC.context<Context>().create({
	/**
	 * @see https://trpc.io/docs/v10/data-transformers
	 */
	transformer: superjson,
	/**
	 * @see https://trpc.io/docs/v10/error-formatting
	 */
	errorFormatter({ shape }) {
		return shape;
	},
});

/**
 * Create a router
 * @see https://trpc.io/docs/v10/router
 */
export const router = t.router;

/**
 * Create an unprotected procedure
 * @see https://trpc.io/docs/v10/procedures
 **/
export const publicProcedure = t.procedure;

/**
 * @see https://trpc.io/docs/v10/middlewares
 */
export const middleware = t.middleware;

/**
 * @see https://trpc.io/docs/v10/merging-routers
 */
export const mergeRouters = t.mergeRouters;

const isAuthed = middleware(async ({ next, ctx }) => {
	const session = ctx.session?.user;

	if (!session?.name) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorizedaaaaaaaaaaaaaaaaaaaaaaaaaa' });
	}

	const user = await prisma.user.findUnique({
		where: {
			username: session.name,
		},
	});

	return next({
		ctx: {
			user: {
				id: user?.id,
				username: user?.username,
			},
		},
	});
});

export const authedProcedure = t.procedure.use(isAuthed);
