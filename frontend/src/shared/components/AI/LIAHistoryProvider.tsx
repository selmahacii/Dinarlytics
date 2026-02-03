import React, { createContext, useContext, useState, useEffect } from 'react';

interface Conversation {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }>;
  context?: {
    page: string;
    entity?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
}

interface LIAHistoryContextType {
  conversations: Conversation[];
  favorites: Conversation[];
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getConversation: (id: string) => Conversation | undefined;
  clearHistory: () => void;
}

const LIAHistoryContext = createContext<LIAHistoryContextType | undefined>(undefined);

export const useLIAHistory = () => {
  const context = useContext(LIAHistoryContext);
  if (!context) {
    throw new Error('useLIAHistory must be used within LIAHistoryProvider');
  }
  return context;
};

interface LIAHistoryProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const LIAHistoryProvider: React.FC<LIAHistoryProviderProps> = ({ 
  children, 
  userId = 'default' 
}) => {
  const storageKey = `lia_history_${userId}`;
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Charger depuis le localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir les dates
        const converted = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(converted);
      }
    } catch (error) {
      console.error('Error loading LIA history:', error);
    }
  }, [storageKey]);

  // Sauvegarder dans le localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving LIA history:', error);
    }
  }, [conversations, storageKey]);

  const addConversation = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev].slice(0, 50)); // Limiter à 50 conversations
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id
          ? { ...conv, ...updates, updatedAt: new Date() }
          : conv
      )
    );
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id
          ? { ...conv, isFavorite: !conv.isFavorite, updatedAt: new Date() }
          : conv
      )
    );
  };

  const getConversation = (id: string) => {
    return conversations.find(conv => conv.id === id);
  };

  const clearHistory = () => {
    setConversations([]);
    localStorage.removeItem(storageKey);
  };

  const favorites = conversations.filter(conv => conv.isFavorite);

  return (
    <LIAHistoryContext.Provider
      value={{
        conversations,
        favorites,
        addConversation,
        updateConversation,
        deleteConversation,
        toggleFavorite,
        getConversation,
        clearHistory
      }}
    >
      {children}
    </LIAHistoryContext.Provider>
  );
};

