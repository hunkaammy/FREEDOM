export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Persona {
  id: string;
  name: string;
  profession: string;
  systemInstruction: string;
  avatar?: string;
}
