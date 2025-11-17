import React, { useState, useEffect, useRef } from 'react';
import { Persona } from '../types';
import { CloseIcon, UserIcon } from './icons';
import { fileToBase64 } from '../utils/imageUtils';
import Avatar from './Avatar';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (persona: Persona) => void;
  onDelete: (personaId: string) => void;
  personaToEdit?: Persona | null;
}

const PersonaModal: React.FC<PersonaModalProps> = ({ isOpen, onClose, onSave, personaToEdit, onDelete }) => {
  const [persona, setPersona] = useState<Partial<Persona>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (personaToEdit) {
      setPersona(personaToEdit);
      setAvatarPreview(personaToEdit.avatar || null);
    } else {
      setPersona({
        name: '',
        profession: '',
        systemInstruction: '',
        avatar: '',
      });
      setAvatarPreview(null);
    }
  }, [personaToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersona((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setPersona((prev) => ({ ...prev, avatar: base64 }));
      setAvatarPreview(base64);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (persona.name && persona.profession && persona.systemInstruction) {
        onSave(persona as Persona);
    }
  };

  const handleDelete = () => {
    if (personaToEdit?.id) {
        onDelete(personaToEdit.id);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {personaToEdit ? 'Edit Persona' : 'Create New Persona'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
             <div className="flex items-center gap-4">
                <div className="relative">
                    <Avatar avatar={avatarPreview || undefined} name={persona.name || ''} className="w-24 h-24" />
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    ref={fileInputRef}
                />
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                    Upload Picture
                </button>
             </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={persona.name || ''}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-gray-300 mb-1">Profession / Title</label>
              <input
                type="text"
                name="profession"
                id="profession"
                value={persona.profession || ''}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="systemInstruction" className="block text-sm font-medium text-gray-300 mb-1">System Instructions (Personality)</label>
              <textarea
                name="systemInstruction"
                id="systemInstruction"
                value={persona.systemInstruction || ''}
                onChange={handleChange}
                required
                rows={8}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 custom-scrollbar"
                placeholder="Describe the AI's personality, role, and rules..."
              ></textarea>
            </div>
          </div>
          <div className="mt-8 flex justify-between items-center">
            <div>
              {personaToEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Persona
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500"
              disabled={!persona.name || !persona.profession || !persona.systemInstruction}
            >
              Save Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonaModal;