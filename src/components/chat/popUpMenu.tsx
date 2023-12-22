import { ComponentType, useEffect, useRef, useState } from 'react';

export type IPopupMenuItems = {
	name: string;
	onClick?: () => void;
	Icon?: ComponentType<any>;
};

type IPopupMenu = {
	items?: IPopupMenuItems[];
	Icon: ComponentType<any>;
	classBoxItems?: string;
};

export function PopupMenu({ items, Icon, classBoxItems }: IPopupMenu) {
	const [isOpen, setIsOpen] = useState(false);
	const popupRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event: globalThis.MouseEvent) => {
			// @ts-ignore
			if (popupRef.current && !popupRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	function Item({ name, onClick, Icon: IconItem }: IPopupMenuItems) {
		return (
			<>
				{IconItem}
				<p
					className="block px-3 py-1 text-white-800 hover:bg-gray-800 text-[12pt] cursor-pointer select-none rounded-sm"
					onClick={() => {
						setIsOpen(false);
						onClick?.();
					}}
				>
					{name}
				</p>
			</>
		);
	}

	return (
		<div className="relative" ref={popupRef}>
			<Icon
				className="cursor-pointer select-none w-full"
				onClick={() => setIsOpen(!isOpen)}
			/>

			{isOpen && (
				<div
					className={`absolute w-44 py-2 bg-gray-900 rounded shadow-xl ${classBoxItems}`}
				>
					{items?.map(({ name, onClick }, index) => (
						<Item key={index} name={name} onClick={onClick} />
					))}
				</div>
			)}
		</div>
	);
}
