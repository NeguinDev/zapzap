import { SendHorizontal } from 'lucide-react';
import { useState } from 'react';

type InputProps = {
	onSend: (message: string) => void;
};

export function Input({ onSend }: InputProps) {
	const [message, setMessage] = useState('');

	function handleSend() {
		if (!message.trim()) return;

		onSend(message.trim());
		setMessage('');
	}

	return (
		<div className="flex flex-row flex-shrink-0 flex-grow-0 w-full h-14 border-t border-solid border-slate-600 bg-nigger-10">
			<textarea
				autoFocus
				rows={5}
				className="w-full h-full bg-transparent border-none outline-none p-4 bg-none overflow-hidden resize-none"
				placeholder="Digite sua mensagem"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();

						if (e.shiftKey) {
							setMessage((prev) => prev + '\n');
						} else {
							handleSend();
						}
					}
				}}
			/>

			<button className="w-12 h-12 cursor-pointer" onClick={handleSend}>
				<SendHorizontal />
			</button>
		</div>
	);
}
