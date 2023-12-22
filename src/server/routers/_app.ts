import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { messageRouter } from './message';
import { prisma } from '../prisma';

export const appRouter = router({
	healthcheck: publicProcedure.query(() => 'ok'),

	message: messageRouter,

	register: publicProcedure.input(
		z.object({
			username: z.string(),
			password: z.string(),
		})
	).mutation(async ({ input }) => {
		const user = await prisma.user.findUnique({
			where: {
				username: input.username,
			},
		});

		if (user) {
			throw new Error('User already exists');
		}

		const newUser = await prisma.user.create({
			data: {
				username: input.username,
				password: input.password,
			},
		});

		return newUser;
	})
});

export type AppRouter = typeof appRouter;
