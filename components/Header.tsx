import React from 'react';
import { TrashIcon, EditIcon } from './icons.tsx';
import { Persona } from '../types.ts';
import Avatar from './Avatar.tsx';

interface HeaderProps {
  persona: Persona;
  onClearChat: () => void;
  onEditPersona: () => void;
}

const Header: React.FC<HeaderProps> = ({ persona, onClearChat, onEditPersona }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/30 p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center">
        <Avatar avatar={persona.avatar} name={persona.name} />
        <div className="ml-4">
          <h1 className="text-xl font-bold text-white">{persona.name}</h1>
          <p className="text-sm text-green-400">Online</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onEditPersona}
          className="text-gray-400 hover:text-white transition-colors duration-200"
          aria-label="Edit persona"
        >
          <EditIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={onClearChat}
          className="text-gray-400 hover:text-white transition-colors duration-200"
          aria-label="Clear chat history"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;