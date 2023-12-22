import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AppProviders } from 'next-auth/providers/index';
import { prisma } from '@/server/prisma';

const providers: AppProviders = [
	CredentialsProvider({
		name: 'Credentials',
		credentials: {
			username: { label: 'Username', type: 'text' },
			password: { label: 'Password', type: 'password' },
		},
		async authorize(credentials, req) {
			if (!credentials?.username || !credentials?.password)
				throw new Error('Usuário ou senha inválidos');

			const user = await prisma.user.findUnique({
				where: {
					username: credentials.username,
				},
			});

			if (!user) throw new Error('Usuário não encontrado');
			if (user.password !== credentials.password) throw new Error('Senha inválida');

			return {
				id: user.id,
				name: user.username,
			};
		},
	}),
];

export const authOptions: AuthOptions = {
	providers,
	session: {
		strategy: 'jwt',
		maxAge: 7 * 24 * 60 * 60, // 7 days
	},
	secret: process.env.SECRET_JWT,
	theme: {
		logo: '/zapzap-icon.png',
		brandColor: '#00B2FF',
		buttonText: 'Entrar',
		colorScheme: 'dark',
	},
}

export default NextAuth(authOptions);
