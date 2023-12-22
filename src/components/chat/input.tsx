import { SendHorizontal } from 'lucide-react';
import { useState } from 'react';

type InputProps = {
	onSend: (message: string) => void;
};

export function Input({ onSend }: InputProps) {
	const [message, setMessage] = useState('');

	function handleSend() {
		if (!message) return;

		onSend(message);
		setMessage('');
	}

	return (
		<div className="flex flex-row flex-shrink-0 flex-grow-0 w-full h-14 border-t border-solid border-slate-600 bg-nigger-10">
			<input
				id="input"
				autoFocus
				type="text"
				className="w-full h-full bg-transparent border-none outline-none px-2 bg-none"
				placeholder="Digite sua mensagem"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						handleSend();
					}
				}}
			/>

			<button className="w-12 h-12 cursor-pointer" onClick={handleSend}>
				<SendHorizontal />
			</button>
		</div>
	);
}
