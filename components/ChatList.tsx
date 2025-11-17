import React from 'react';
import { Persona } from '../types';
import { PlusIcon } from './icons';
import Avatar from './Avatar';

interface ChatListProps {
  personas: Persona[];
  activePersonaId: string | null;
  onSelectPersona: (id: string) => void;
  onAddPersona: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ personas, activePersonaId, onSelectPersona, onAddPersona }) => {
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-900/80 border-r border-purple-500/30 flex flex-col">
      <div className="p-4 border-b border-purple-500/30 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Chats</h2>
        <button 
          onClick={onAddPersona}
          className="text-gray-300 hover:text-white transition-colors"
          aria-label="Add new persona"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
      <ul className="overflow-y-auto custom-scrollbar">
        {personas.map((persona) => (
          <li key={persona.id}>
            <button
              onClick={() => onSelectPersona(persona.id)}
              className={`w-full text-left p-4 flex items-center gap-4 transition-colors duration-200 ${
                activePersonaId === persona.id
                  ? 'bg-purple-900/50'
                  : 'hover:bg-gray-800/60'
              }`}
            >
              <Avatar avatar={persona.avatar} name={persona.name} />
              <div className="flex-1 overflow-hidden">
                <h3 className="font-semibold text-white truncate">{persona.name}</h3>
                <p className="text-sm text-gray-400 truncate">{persona.profession}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
