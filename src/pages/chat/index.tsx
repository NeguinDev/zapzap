'use client';
import React, { useEffect, useRef, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Inter } from 'next/font/google';
import { getSession, signOut, useSession } from 'next-auth/react';
import { Message as MessageDB, User } from '@prisma/client';

import { Contact, Sidebar } from '@/components/chat/contacts';
import { HeaderChat, Message, Messages, ChatContainer } from '@/components/chat/messages';
import { Input } from '@/components/chat/input';
import { trpc } from '@/utils/trpc';
import Head from 'next/head';
import { formatTime } from '@/helpers/formatTime';
import { useRouter } from 'next/router';
import { LogOut } from 'lucide-react';
import { IPopupMenuItems } from '@/components/chat/popUpMenu';

const inter = Inter({ subsets: ['latin'] });

type ContactData = {
	username: string;
	id: string;
	avatar?: Buffer | null;
	lastMessage?: MessageDB | null;
	status?: string;
	lastSeen?: Date;
};

type MessageData = {
	id: string;
	text: string;
	time: string;
	received?: boolean;
};

export default function ChatPage() {
	const { data: session } = useSession();
	const [showContacts, setShowContacts] = useState(true);
	const [messages, setMessages] = useState<MessageData[]>([]);
	const [users, setUsers] = useState<ContactData[]>([]);
	const [contactSelected, setContactSelected] = useState<ContactData>();
	const [ctxMenu, setCtxMenu] = useState({ visible: false, x: 0, y: 0, data: null });
	const [me, setMe] = useState<ContactData>();
	const ctxMenuRef = useRef(null);
	const router = useRouter();

	const { mutateAsync: getMe } = trpc.message.me.useMutation();
	const { mutateAsync: getUsers } = trpc.message.users.useMutation();
	const { mutateAsync: getMessages } = trpc.message.messages.useMutation();
	const { mutateAsync: sendMessage } = trpc.message.send.useMutation();
	const { mutateAsync: clearChat } = trpc.message.clearChat.useMutation();
	const { mutateAsync: updateStatus } = trpc.message.updateStatus.useMutation();

	const itemsPopup: IPopupMenuItems[] = [
		{
			name: 'Limpar Conversa',
			onClick: () => {
				if (!contactSelected) return;

				clearChat({ userId: contactSelected.id }).then(() => {
					setMessages([]);
					setUsers(getUpdatedUsersWithLastMessage(contactSelected.id));
				});
			},
		},
	];

	const itemsCtxMenu = [
		{
			name: 'Limpar Conversa',
			onClick: ({ id: userId }: any) => {
				if (!userId) return;

				clearChat({ userId }).then(() => {
					setMessages([]);
					setUsers(getUpdatedUsersWithLastMessage(userId));
				});
			},
		},
		{
			name: 'Bloquear',
			onClick: (data: any) => {
				if (!data) return;

				console.log('bloquear', data);
			},
		},
	];

	const itemsProfile: IPopupMenuItems[] = [
		{
			name: 'Sair',
			icon: LogOut,
			onClick: () => {
				signOut({
					redirect: false,
				});

				router.push('/login');
			},
		},
		{
			name: 'Alterar Foto de Perfil',
			onClick: () => {
				console.log('alterar foto de perfil');
			},
		},
	];

	trpc.message.onMessage.useSubscription(undefined, {
		onData(data) {
			setMessages((prev) => [
				...prev,
				{
					id: data.id,
					text: data.text,
					time: formatTime(new Date(data.createdAt)),
					received: true,
				},
			]);

			setUsers(getUpdatedUsersWithLastMessage(data.fromId, data));
			scrollToMessage(data.id);
		},
	});

	trpc.message.onStatusChange.useSubscription(undefined, {
		onData(data) {
			setUsers((prev) => {
				const index = prev.findIndex((value) => value.id === data.userId);

				if (index === -1) return prev;
				if (contactSelected?.id === data.userId) {
					setContactSelected((prev) => {
						if (!prev) return prev;

						return {
							...prev,
							status: data.status,
							lastSeen: data.lastSeen,
						};
					});
				}

				const newUsers = [...prev];
				newUsers[index].status = data.status;
				newUsers[index].lastSeen = data.lastSeen;

				return newUsers;
			});
		},
	});

	const handleContactClick = (contact: ContactData) => {
		setContactSelected(contact);
		setShowContacts(false);

		getMessages({ userId: contact.id }).then((data) => {
			const messages = data.map((value) => ({
				id: value.id,
				text: value.text,
				time: formatTime(new Date(value.createdAt)),
				received: value.fromId === contact.id,
			}));

			setMessages(messages);
			if (messages.length > 0) {
				scrollToMessage(messages[messages.length - 1].id, false);
			}
		});
	};

	const handleMessageSend = (text: string) => {
		if (!contactSelected) return;

		sendMessage({
			text,
			userId: contactSelected.id,
		}).then((data) => {
			setMessages((prev) => [
				...prev,
				{
					id: data.id,
					text: data.text,
					time: formatTime(new Date(data.createdAt)),
					received: false,
				},
			]);

			scrollToMessage(data.id);
			setUsers(getUpdatedUsersWithLastMessage(contactSelected.id, data));
		});
	};

	const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any) => {
		event.preventDefault();
		setCtxMenu({
			visible: true,
			x: event.pageX,
			y: event.pageY,
			data,
		});
	};

	const handleClose = () => {
		setCtxMenu({ visible: false, x: 0, y: 0, data: null });
	};

	const formatStatusUser = (user: ContactData) => {
		switch (user.status) {
			case 'online':
				return 'Online';
			case 'offline':
				return `Visto por último ${formatTime(user.lastSeen!)}`;
			default:
				return 'Indisponível';
		}
	};

	useEffect(() => {
		if (!session) return;

		getMe().then((data) => setMe(data!));
		getUsers().then((data) => setUsers(data));

		const handleClickOutside = (event: globalThis.MouseEvent) => {
			// @ts-ignore
			if (ctxMenuRef.current && !ctxMenuRef.current.contains(event.target)) {
				handleClose();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);

		const handleUpdateStatus = (visible: boolean) => {
			updateStatus({ status: visible ? 'online' : 'offline' });
		};

		const handleVisibilityChange = () => {
			handleUpdateStatus(document.visibilityState === 'visible');
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [session, getUsers, updateStatus, getMe]);

	const ContextMenu = (
		<div
			ref={ctxMenuRef}
			className="mt-2 w-44 py-1 bg-gray-900 rounded shadow-xl"
			style={{
				position: 'absolute',
				top: `${ctxMenu.y}px`,
				left: `${ctxMenu.x}px`,
				zIndex: 1000,
			}}
		>
			{itemsCtxMenu.map(({ name, onClick }, index) => (
				<p
					className="px-3 py-1 text-white-800 hover:bg-gray-800 text-[10pt] cursor-pointer select-none rounded-sm"
					key={index}
					onClick={() => {
						onClick?.(ctxMenu.data);
						handleClose();
					}}
				>
					{name}
				</p>
			))}
		</div>
	);

	return (
		<main className={`flex flex-row text-white ${inter.className} h-screen`}>
			<Head>
				<title>ZapZap - Chat</title>
			</Head>
			<Sidebar
				show={showContacts}
				propsFooter={{
					username: me?.username!,
					avatar: me?.avatar,
					itemsMenu: itemsProfile,
				}}
			>
				{ctxMenu.visible && ContextMenu}

				{users.map((user) => {
					const { id, username, lastMessage } = user;
					let lastMessageText = lastMessage?.text;

					if (lastMessageText && lastMessage?.fromId !== id) {
						lastMessageText = `Você: ${lastMessageText}`;
					}

					return (
						<Contact
							key={id}
							username={username}
							active={id === contactSelected?.id}
							lastMessage={lastMessageText}
							onClick={() => handleContactClick(user)}
							onContextMenu={(event) => handleContextMenu(event, user)}
						/>
					);
				})}
			</Sidebar>

			{contactSelected ? (
				<ChatContainer setShowContacts={setShowContacts} showContacts={showContacts}>
					<HeaderChat
						name={contactSelected?.username}
						status={formatStatusUser(contactSelected)}
						setShowContacts={setShowContacts}
						itemsPopup={itemsPopup}
					/>

					<Messages>
						{messages.map((value) => {
							return <Message key={value.id} {...value} />;
						})}
					</Messages>

					<Input onSend={handleMessageSend} />
				</ChatContainer>
			) : null}
		</main>
	);
}

function getUpdatedUsersWithLastMessage(
	userId: string,
	data?: MessageDB
): React.SetStateAction<ContactData[]> {
	return (prev) => {
		const newUsers = [...prev];
		const index = newUsers.findIndex((value) => value.id === userId);

		if (index === -1) return prev;

		if (data) {
			newUsers[index].lastMessage = {
				id: data.id,
				text: data.text,
				createdAt: data.createdAt,
				fromId: data.fromId,
				toId: data.toId,
				updatedAt: data.updatedAt,
			};
		} else {
			newUsers[index].lastMessage = null;
		}

		return newUsers;
	};
}

function scrollToMessage(id: string, smooth: boolean = true) {
	setTimeout(() => {
		const elem = document.getElementById(id);
		elem?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
	}, 1);
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
		props: {
			session,
		},
	};
};
