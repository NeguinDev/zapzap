'use client';
import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { getSession, signIn } from 'next-auth/react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';

import LogoIcon from '@/public/zapzap-icon.png';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export default function LoginPage() {
	const router = useRouter();
	const { register, handleSubmit } = useForm();
	const [error, setError] = useState('');

	const handleSignIn: SubmitHandler<FieldValues> = async ({ username, password }) => {
		try {
			const response = await signIn('credentials', {
				username,
				password,
				redirect: false,
			});
			
			if (response?.ok) {
				router.push('/chat');
				router.reload();
				return;
			} else {
				return setError(response?.error || 'Erro desconhecido');
			}
		} catch (error) {
			console.log(error);
			setError('Erro desconhecido');
		}
	};

	return (
		<main className={`${inter.className} h-screen`}>
			<Head>
				<title>ZapZap - Login</title>
			</Head>
			<div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-sm">
					<div className="flex flex-row justify-center">
						<Image className="h-10 w-auto mr-3" src={LogoIcon} alt="Logo" />
						<span className="text-3xl font-extrabold text-white">ZapZap</span>
					</div>
					<h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
						Entre na sua conta
					</h2>
				</div>

				<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
					<form className="space-y-6" onSubmit={handleSubmit(handleSignIn)}>
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium leading-6 text-white"
							>
								Username
							</label>
							<div className="mt-2">
								<input
									{...register('username')}
									id="username"
									name="username"
									type="text"
									autoComplete="username"
									required
									className="block w-full rounded-md border-0 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-2 bg-gray-950"
								/>
							</div>
						</div>

						<div>
							<div className="flex items-center justify-between">
								<label
									htmlFor="password"
									className="block text-sm font-medium leading-6 text-white"
								>
									Password
								</label>
							</div>
							<div className="mt-2">
								<input
									{...register('password')}
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
									className="block w-full rounded-md border-0 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 px-2 bg-gray-950"
								/>
							</div>
						</div>

						<div className="text-red-500 text-sm font-semibold text-center">
							{error}
						</div>

						<div>
							<button
								type="submit"
								className="flex w-full justify-center rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
							>
								Entrar
							</button>
						</div>
					</form>
				</div>

				<p className="mt-10 text-center text-sm text-gray-300">
					Não tem uma conta?{' '}
					<Link
						href="/register"
						className="font-semibold leading-6 text-green-700 hover:text-green-600"
					>
						Crie uma agora
					</Link>
				</p>
			</div>
		</main>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await getSession(context);

	if (session) {
		return {
			redirect: {
				destination: '/chat',
				permanent: false,
			},
		};
	}

	return {
		props: {
			session,
		},
	};
};
