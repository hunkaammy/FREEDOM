import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, MicIcon } from './icons.tsx';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.ts';


interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasSupport,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
        setInput(prev => (prev ? prev + ' ' : '') + transcript);
    }
  }, [transcript]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border-t border-purple-500/30 p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Aap kya kehna chahte hain..."
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-gray-800 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none max-h-40 custom-scrollbar"
        />
        {hasSupport && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading}
            className={`p-3 rounded-full transition-colors duration-200 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MicIcon className="w-6 h-6" />
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;