import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authedProcedure, router } from '../trpc';
import { Message } from '@prisma/client';

type UserStatus = {
	userId: string;
	status: string;
	lastSeen: Date;
};

interface MyEvents {
	message: (data: Message) => void;
	userStatus: (data: UserStatus) => void;
}
declare interface MyEventEmitter {
	on<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
	off<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
	once<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
	emit<TEv extends keyof MyEvents>(event: TEv, ...args: Parameters<MyEvents[TEv]>): boolean;
}
class MyEventEmitter extends EventEmitter {}

const ee = new MyEventEmitter();

function getLastMessage({ fromId, toId }: { fromId: string; toId: string }) {
	return prisma.message.findFirst({
		where: {
			OR: [
				{
					fromId,
					toId,
				},
				{
					fromId: toId,
					toId: fromId,
				},
			],
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
}

export const messageRouter = router({
	me: authedProcedure.mutation(async ({ ctx }) => {
		ee.emit('userStatus', {
			userId: ctx.user.id!,
			status: 'online',
			lastSeen: new Date(),
		});

		const user = await prisma.user.update({
			where: {
				id: ctx.user.id!,
			},
			data: {
				status: 'online',
				lastSeen: new Date(),
			},
			select: {
				id: true,
				username: true,
				status: true,
				lastSeen: true,
				avatar: true,
			},
		});

		const base64 = user.avatar?.toString('base64');
		const avatar = base64 ? `data:image/png;base64,${base64}` : null;

		return {
			...user,
			avatar,
		};
	}),

	users: authedProcedure.mutation(async ({ ctx }) => {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				username: true,
				status: true,
				lastSeen: true,
				avatar: true,
			},
			where: {
				id: {
					not: ctx.user.id,
				},
			},
		});

		const usersWithLastMessageAndAvatarBase64 = await Promise.all(
			users.map(async (user) => {
				const base64 = user.avatar?.toString('base64');
				const avatar = base64 ? `data:image/png;base64,${base64}` : null;

				const lastMessage = await getLastMessage({
					fromId: user.id,
					toId: ctx.user.id!,
				});

				return {
					...user,
					avatar,
					lastMessage,
				};
			})
		);

		return usersWithLastMessageAndAvatarBase64;
	}),

	getLastMessage: authedProcedure
		.input(
			z.object({
				userId: z.string(),
			})
		)
		.subscription(async ({ ctx: { user }, input }) => {
			return prisma.message.findFirst({
				where: {
					OR: [
						{
							fromId: input.userId,
							toId: user.id,
						},
						{
							fromId: user.id,
							toId: input.userId,
						},
					],
				},
				orderBy: {
					createdAt: 'desc',
				},
			});
		}),

	messages: authedProcedure
		.input(
			z.object({
				userId: z.string(),
			})
		)
		.mutation(async ({ input, ctx: { user } }) => {
			return prisma.message.findMany({
				where: {
					OR: [
						{
							fromId: input.userId,
							toId: user.id,
						},
						{
							fromId: user.id,
							toId: input.userId,
						},
					],
				},
				orderBy: {
					createdAt: 'asc',
				},
			});
		}),

	send: authedProcedure
		.input(
			z.object({
				text: z.string().min(1),
				userId: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const message = await prisma.message.create({
				data: {
					text: input.text,
					from: {
						connect: {
							id: ctx.user.id,
						},
					},
					to: {
						connect: {
							id: input.userId,
						},
					},
				},
			});

			ee.emit('message', message);

			return message;
		}),

	onMessage: authedProcedure.subscription(({ ctx }) => {
		return observable<Message>((emit) => {
			const onAdd = (data: Message) => {
				if (data.toId === ctx?.user?.id) {
					emit.next(data);
				}
			};

			ee.on('message', onAdd);
			return () => {
				ee.off('message', onAdd);
			};
		});
	}),

	updateStatus: authedProcedure
		.input(
			z.object({
				status: z.string(),
			})
		)
		.mutation(({ input, ctx }) => {
			ee.emit('userStatus', {
				userId: ctx.user.id!,
				status: input.status,
				lastSeen: new Date(),
			});

			prisma.user.update({
				where: {
					id: ctx.user.id!,
				},
				data: {
					status: input.status,
					lastSeen: new Date(),
				},
			});

			return true;
		}),

	onStatusChange: authedProcedure.subscription(() => {
		return observable<UserStatus>((emit) => {
			const onAdd = (data: UserStatus) => {
				emit.next(data);
			};

			ee.on('userStatus', onAdd);
			return () => {
				ee.off('userStatus', onAdd);
			};
		});
	}),

	clearChat: authedProcedure
		.input(
			z.object({
				userId: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const messages = await prisma.message.deleteMany({
				where: {
					OR: [
						{
							fromId: input.userId,
							toId: ctx.user.id,
						},
						{
							fromId: ctx.user.id,
							toId: input.userId,
						},
					],
				},
			});

			return messages;
		}),

	updateAvatar: authedProcedure
		.input(
			z.object({
				avatar: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const base64 = input.avatar.split(',')[1];
			const avatar = Buffer.from(base64, 'base64');

			const user = await prisma.user.update({
				where: {
					id: ctx.user.id!,
				},
				data: {
					avatar,
				},
				select: {
					id: true,
					username: true,
					status: true,
					lastSeen: true,
					avatar: true,
				},
			});

			return {
				...user,
				avatar: input.avatar,
			};
		}),
});
