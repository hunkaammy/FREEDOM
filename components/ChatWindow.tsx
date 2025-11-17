import React, { useRef, useEffect } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-3 my-4 justify-start">
        <div className="max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-4 py-3 shadow-md bg-gray-700 text-gray-200 rounded-bl-none flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
    </div>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            {messages.map((msg) => (
                <Message key={msg.id} message={msg} />
            ))}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && <TypingIndicator />}
            <div ref={chatEndRef} />
        </div>
    );
};

export default ChatWindow;
