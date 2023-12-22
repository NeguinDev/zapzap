'use client';
import { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { MoreVertical, MoveLeft } from 'lucide-react';
import { IPopupMenuItems, PopupMenu } from './popUpMenu';

type IMessagesComponents = {
	setShowContacts: Dispatch<SetStateAction<boolean>>;
	showContacts?: boolean;
	children?: React.ReactNode;
};

type IHeader = {
	avatarUrl?: string;
	name?: string;
	status?: string;
	setShowContacts: IMessagesComponents['setShowContacts'];
	itemsPopup?: IPopupMenuItems[];
};

type IMessage = {
	id: string;
	text: string;
	time: string;
	received?: boolean;
};

export function HeaderChat({ avatarUrl, name, status, setShowContacts, itemsPopup }: IHeader) {
	return (
		<div className="flex flex-row w-full h-14 items-center border-b border-solid border-slate-600 justify-between px-2">
			<div className="flex flex-row items-center">
				<MoveLeft
					className="font-bold text-xl mx-2 lg:hidden cursor-pointer select-none"
					onClick={() => setShowContacts(true)}
				/>
				<Image src={avatarUrl || '/avatar.png'} alt="avatar" width={40} height={40} />
				<div className="flex flex-col ml-2">
					<span className="font-bold text-lg">{name}</span>
					<span className="text-gray-400 text-[12pt]">{status}</span>
				</div>
			</div>

			<div>
				<PopupMenu items={itemsPopup} Icon={MoreVertical} classBoxItems='right-0 mt-3'/>
			</div>
		</div>
	);
}

export function Message({ text, time, received, id }: IMessage) {
	const align = received ? 'start' : 'end';
	const color = received ? 'bg-slate-800' : 'bg-[#00301c]';

	return (
		<div
			id={id}
			style={{
				display: 'flex',
				alignSelf: `flex-${align}`,
			}}
			className={`flex flex-col ${color} max-w-[30rem] max-lg:max-w-[20rem] min-w-[6rem] w-fit rounded-xl px-3 py-1 break-all break-after-all break-before-all m-2`}
		>
			<span className="text-[12pt]">{text}</span>
			<span
				className={`text-[9pt] text-gray-400`}
				style={{
					display: 'flex',
					alignSelf: `flex-${align}`,
				}}
			>
				{time}
			</span>
		</div>
	);
}

export function Messages({ children }: { children?: React.ReactNode }) {
	return (
		<div
			className="flex flex-col overflow-y-auto"
			style={{
				height: 'calc(99vh - 6.5rem)',
			}}
		>
			{children}
		</div>
	);
}

export function ChatContainer({ showContacts, children }: IMessagesComponents) {
	const classShow = showContacts ? 'max-lg:hidden' : '';

	return (
		<div
			className={`flex flex-col w-full h-screen justify-between border border-solid border-slate-600 ${classShow}`}
		>
			<div>{children}</div>
		</div>
	);
}
