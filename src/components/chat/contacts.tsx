import { MouseEventHandler } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

import LogoIcon from '@/public/zapzap-icon.png';
import AvatarIcon from '@/public/avatar.png';
import { IPopupMenuItems, PopupMenu } from './popUpMenu';
import { LogOut } from 'lucide-react';

export type IContact = {
	username: string;
	lastMessage?: string;
	avatarUrl?: string;
	active?: boolean;
	status?: string;
	onClick?: MouseEventHandler<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>;

export function Contact({ username, lastMessage, avatarUrl, active, onClick, ...props }: IContact) {
	const classActive = active ? 'bg-[#303030]' : '';

	return (
		<div
			className={`flex flex-row p-0.5 rounded-md hover:bg-[#252525] ${classActive} cursor-context-menu`}
			onClick={onClick}
			{...props}
		>
			<div className="rounded-full overflow-hidden my-auto mr-2 flex-shrink-0">
				<Image
					src={avatarUrl || AvatarIcon}
					alt="avatar"
					width={40}
					height={40}
					className="w-auto h-auto"
				/>
			</div>

			<div className="flex flex-col overflow-hidden">
				<span className="font-semibold truncate">{username}</span>
				<span className="text-gray-400 text-[12pt] truncate">{lastMessage}</span>
			</div>
		</div>
	);
}

function HeaderSidebar() {
	const router = useRouter();

	return (
		<div className="border-b border-solid border-slate-600 h-14">
			<div className="flex flex-row justify-between items-center py-3 mx-2">
				<Image src={LogoIcon} alt="logo" width={30} height={30} />
				<span className="ml-2 font-bold text-xl">ZapZap</span>
				<LogOut
					width={25}
					height={25}
					className="cursor-pointer"
					onClick={() => {
						signOut({
							redirect: false,
						});
						router.push('/login');
					}}
				/>
			</div>
		</div>
	);
}

type IFooterSidebar = {
	username: string;
	avatar?: Buffer | null;
	itemsMenu: IPopupMenuItems[];
};

function FooterSidebar({ username, avatar, itemsMenu }: IFooterSidebar) {
	const avatarBase64 = avatar ? Buffer.from(avatar).toString('base64') : null;
	const avatarUrl = avatarBase64 ? `data:image/png;base64,${avatarBase64}` : null;

	const Profile = (props: React.PropsWithChildren) => (
		<div {...props} className="flex flex-row items-center">
			<Image
				src={avatarUrl || AvatarIcon}
				alt="avatar"
				width={40}
				height={40}
				className="w-auto h-auto"
			/>
			<span className="font-bold ml-1">{username}</span>
		</div>
	);

	return (
		<div className="flex flex-row justify-between items-center h-14 border-t border-solid border-slate-600 bg-nigger-10">
			<div className="select-none cursor-pointer">
				<PopupMenu Icon={Profile} classBoxItems="bottom-0 mb-12 w-48" items={itemsMenu} />
			</div>
		</div>
	);
}

type ISidebar = {
	show?: boolean;
	children?: React.ReactNode;
	propsFooter?: IFooterSidebar | null;
};

export function Sidebar({ show, children, propsFooter }: ISidebar) {
	const classShow = show ? '' : 'max-lg:hidden';

	return (
		<div
			className={`w-full lg:w-1/5 h-screen flex flex-col justify-between border border-solid border-slate-600 overflow-y-auto ${classShow}`}
		>
			<HeaderSidebar />
			<div className="flex-grow">{children}</div>
			{propsFooter ? <FooterSidebar {...propsFooter} /> : null}
		</div>
	);
}
