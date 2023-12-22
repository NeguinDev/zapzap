import '@/styles/globals.css';
import type { AppType } from 'next/app';
import { Session } from 'next-auth';
import { SessionProvider, getSession } from 'next-auth/react';
import { trpc } from '../utils/trpc';

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps }) => {
	return (
		<SessionProvider session={pageProps.session}>
			<Component {...pageProps} />
		</SessionProvider>
	);
};

MyApp.getInitialProps = async ({ ctx }) => {
	return {
		session: await getSession(ctx),
	};
};

export default trpc.withTRPC(MyApp);
