import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chat } from '@google/genai';
import { Message, Persona } from './types.ts';
import { initializeChat, sendMessage } from './services/geminiService.ts';
import { personas as defaultPersonas } from './personas.ts';

import Header from './components/Header.tsx';
import ChatWindow from './components/ChatWindow.tsx';
import ChatInput from './components/ChatInput.tsx';
import ChatList from './components/ChatList.tsx';
import PersonaModal from './components/PersonaModal.tsx';

const App: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>(() => {
    try {
      const savedPersonas = localStorage.getItem('hinglish-chat-personas');
      return savedPersonas ? JSON.parse(savedPersonas) : defaultPersonas;
    } catch {
      return defaultPersonas;
    }
  });

  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  
  const [allMessages, setAllMessages] = useState<{[personaId: string]: Message[]}>(() => {
    try {
      const saved = localStorage.getItem('hinglish-multi-chat-history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [chatInstances, setChatInstances] = useState<{[personaId: string]: Chat}>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [personaToEdit, setPersonaToEdit] = useState<Persona | null>(null);
  
  const activePersona = useMemo(() => personas.find(p => p.id === activePersonaId), [activePersonaId, personas]);
  const activeMessages = useMemo(() => allMessages[activePersonaId!] || [], [allMessages, activePersonaId]);

  useEffect(() => {
    localStorage.setItem('hinglish-multi-chat-history', JSON.stringify(allMessages));
  }, [allMessages]);

  useEffect(() => {
    localStorage.setItem('hinglish-chat-personas', JSON.stringify(personas));
  }, [personas]);

  const getFormattedTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getOrCreateChatInstance = useCallback((persona: Persona): Chat => {
    if (chatInstances[persona.id]) {
      return chatInstances[persona.id];
    }
    try {
      const newChat = initializeChat(persona.systemInstruction);
      setChatInstances(prev => ({...prev, [persona.id]: newChat}));
      return newChat;
    } catch(err) {
       console.error(err);
       setError("Failed to initialize chat. Check your API Key.");
       throw err;
    }
  }, [chatInstances]);

  const startNewConversation = useCallback(async (persona: Persona) => {
    setIsLoading(true);
    setError(null);
    try {
      const chat = getOrCreateChatInstance(persona);
      const stream = await sendMessage(chat, "Start the conversation with a greeting.");
      const modelMessageId = `model-${Date.now()}`;
      let currentText = '';
      
      const initialMessage: Message = {
        id: modelMessageId,
        role: 'model',
        text: '',
        timestamp: getFormattedTimestamp(),
      };
      setAllMessages(prev => ({...prev, [persona.id]: [initialMessage]}));
      
      for await (const chunk of stream) {
        currentText += chunk.text;
        setAllMessages(prev => ({
          ...prev,
          [persona.id]: prev[persona.id]?.map(m =>
            m.id === modelMessageId ? { ...m, text: currentText } : m
          )
        }));
      }
    } catch (err) {
      console.error(err);
      setError("Sorry, could not start conversation. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  }, [getOrCreateChatInstance]);

  const handleSelectPersona = useCallback((id: string) => {
    setActivePersonaId(id);
    if (!allMessages.hasOwnProperty(id)) {
        const persona = personas.find(p => p.id === id);
        if (persona) {
            startNewConversation(persona);
        }
    }
  }, [allMessages, startNewConversation, personas]);

  const handleSendMessage = async (userInput: string) => {
    if (!activePersona) return;

    const chat = getOrCreateChatInstance(activePersona);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userInput,
      timestamp: getFormattedTimestamp(),
    };
    
    setAllMessages(prev => ({
        ...prev,
        [activePersona.id]: [...(prev[activePersona.id] || []), userMessage]
    }));
    setIsLoading(true);
    setError(null);

    try {
      const stream = await sendMessage(chat, userInput);
      const modelMessageId = `model-${Date.now()}`;
      let currentText = '';

      const initialModelMessage: Message = {
        id: modelMessageId,
        role: 'model',
        text: '',
        timestamp: getFormattedTimestamp(),
      };
      setAllMessages(prev => ({
          ...prev,
          [activePersona.id]: [...prev[activePersona.id], initialModelMessage]
      }));
      
      for await (const chunk of stream) {
        currentText += chunk.text;
        setAllMessages(prev => ({
            ...prev,
            [activePersona.id]: prev[activePersona.id].map(m =>
                m.id === modelMessageId ? { ...m, text: currentText.trim() } : m
            )
        }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to get a response. Please try again.");
      setAllMessages(prev => ({
          ...prev,
          [activePersona.id]: prev[activePersona.id].slice(0, -1)
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearChat = () => {
    if (!activePersonaId) return;

    if (window.confirm("Are you sure you want to clear this chat history? This cannot be undone.")) {
      setAllMessages(prev => ({
        ...prev,
        [activePersonaId]: []
      }));
      setChatInstances(prev => {
        const newInstances = {...prev};
        delete newInstances[activePersonaId];
        return newInstances;
      });
    }
  };

  const handleAddPersona = () => {
    setPersonaToEdit(null);
    setIsPersonaModalOpen(true);
  }

  const handleEditPersona = () => {
    if (activePersona) {
        setPersonaToEdit(activePersona);
        setIsPersonaModalOpen(true);
    }
  }

  const handleSavePersona = (personaData: Persona) => {
    if (personaData.id && personaData.id !== '') { // Editing existing
      setPersonas(prev => prev.map(p => p.id === personaData.id ? personaData : p));
      
      // Reset chat for the edited persona
      setAllMessages(prev => {
        const newAllMessages = { ...prev };
        delete newAllMessages[personaData.id];
        return newAllMessages;
      });
      setChatInstances(prev => {
        const newInstances = { ...prev };
        delete newInstances[personaData.id];
        return newInstances;
      });
      
      // If the edited persona was active, re-start the conversation
      if(activePersonaId === personaData.id) {
          startNewConversation(personaData);
      }

    } else { // Adding new
      const newPersona = { ...personaData, id: `persona-${Date.now()}` };
      setPersonas(prev => [...prev, newPersona]);
      setActivePersonaId(newPersona.id);
      startNewConversation(newPersona);
    }
    setIsPersonaModalOpen(false);
  }

  const handleDeletePersona = (personaId: string) => {
    if (window.confirm("Are you sure you want to delete this persona and all its chat history? This action cannot be undone.")) {
      setPersonas(prev => prev.filter(p => p.id !== personaId));
      
      setAllMessages(prev => {
        const newAllMessages = { ...prev };
        delete newAllMessages[personaId];
        return newAllMessages;
      });

      setChatInstances(prev => {
        const newInstances = { ...prev };
        delete newInstances[personaId];
        return newInstances;
      });

      if (activePersonaId === personaId) {
        setActivePersonaId(null);
      }

      setIsPersonaModalOpen(false);
    }
  };

  return (
    <>
      <div className="h-screen w-screen flex bg-gray-900 text-white font-sans">
        <ChatList 
          personas={personas}
          activePersonaId={activePersonaId}
          onSelectPersona={handleSelectPersona}
          onAddPersona={handleAddPersona}
        />
        <div className="flex-1 flex flex-col min-h-0">
          {activePersona ? (
            <>
              <Header 
                persona={activePersona} 
                onClearChat={handleClearChat}
                onEditPersona={handleEditPersona}
              />
              {error && <div className="bg-red-500 text-white p-2 text-center text-sm">{error}</div>}
              <ChatWindow messages={activeMessages} isLoading={isLoading} />
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 p-8">
                <h1 className="text-2xl font-bold">Select a chat to begin</h1>
                <p className="mt-2">Choose a persona from the left panel, or create your own by clicking the '+' icon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <PersonaModal 
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        onSave={handleSavePersona}
        onDelete={handleDeletePersona}
        personaToEdit={personaToEdit}
      />
    </>
  );
};

export default App;