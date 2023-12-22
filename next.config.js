/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	publicRuntimeConfig: {
		APP_URL: process.env.APP_URL,
		WS_URL: process.env.WS_URL,
	},
};

module.exports = nextConfig;
