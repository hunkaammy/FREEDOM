import React from 'react';
import { ModelIcon } from './icons.jsx';

const Avatar = ({ avatar, name, className = 'w-12 h-12' }) => {
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center">
            <ModelIcon className="w-3/4 h-3/4 text-purple-400" />
        </div>
      )}
      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-gray-900"></span>
    </div>
  );
};

export default Avatar;