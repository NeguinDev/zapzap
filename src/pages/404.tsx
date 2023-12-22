import Link from 'next/link';

export default function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center p-10">
			<p className="text-4xl mb-10">404</p>
			<p className="text-2xl">A página que você está procurando não existe.</p>
			<Link
				href="/"
				className="text-lg border border-white bg-transparent p-2 rounded-full hover:underline mt-3"
			>
				Voltar para a página inicial
			</Link>
		</main>
	);
}
