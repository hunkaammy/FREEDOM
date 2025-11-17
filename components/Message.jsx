import React from 'react';
import { UserIcon, ModelIcon } from './icons.jsx';

const Message = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <ModelIcon className="w-8 h-8 text-purple-400" />
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-4 py-3 shadow-md ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-200 rounded-bl-none'
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
        <p className={`text-xs mt-2 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp}
        </p>
      </div>
      {isUser && (
        <div className="flex-shrink-0">
          <UserIcon className="w-8 h-8 text-blue-300" />
        </div>
      )}
    </div>
  );
};

export default Message;