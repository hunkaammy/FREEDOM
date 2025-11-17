import { useState, useEffect, useRef } from 'react';

// FIX: Add types for the Web Speech API which are not available in standard TypeScript libs.
// This will resolve errors related to SpeechRecognition and its associated event types.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      const instance = new SpeechRecognitionAPI();
      instance.continuous = true;
      instance.lang = 'en-IN';
      instance.interimResults = false;
      recognitionRef.current = instance;
    }
  }, []);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || isListening) return;
    setTranscript('');
    setError(null);
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || !isListening) return;
    recognition.stop();
    setIsListening(false);
  };

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    const handleResult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => (prev ? prev + ' ' : '') + finalTranscript.trim());
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        setError(event.error);
      }
      setIsListening(false);
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('error', handleError);
    recognition.addEventListener('end', handleEnd);

    return () => {
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('error', handleError);
      recognition.removeEventListener('end', handleEnd);
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    hasSupport: !!recognitionRef.current,
  };
};
