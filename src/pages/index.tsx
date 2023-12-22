import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';

export default function Home() {
	return <></>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await getSession(context);

	if (!session) {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		};
	}

	return {
		redirect: {
			destination: '/chat',
			permanent: false,
		},
	};
};
