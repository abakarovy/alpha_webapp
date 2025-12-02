import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  messages: Message[];
}

interface ConversationStore {
  conversations: Conversation[];
  addConversation: (id: string, title: string, lastMessage: string) => void;
  updateConversation: (id: string, lastMessage: string) => void;
  deleteConversation: (id: string) => void;
  getConversationMessages: (id: string) => Message[];
  addMessage: (conversationId: string, role: 'user' | 'assistant', content: string) => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      addConversation: (id, title, lastMessage) =>
        set((state) => {
          // Check if conversation already exists
          const existingIndex = state.conversations.findIndex((conv) => conv.id === id);
          
          if (existingIndex !== -1) {
            // Update existing conversation instead of adding duplicate
            const updated = state.conversations.map((conv, idx) =>
              idx === existingIndex
                ? { ...conv, title, lastMessage, updatedAt: Date.now() }
                : conv
            );
            // Move to top and sort by updatedAt
            return {
              conversations: updated.sort((a, b) => b.updatedAt - a.updatedAt),
            };
          }
          
          // Add new conversation with initial message
          const initialMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: lastMessage,
            timestamp: Date.now(),
          };
          
          return {
            conversations: [
              {
                id,
                title,
                lastMessage,
                updatedAt: Date.now(),
                messages: [initialMessage],
              },
              ...state.conversations,
            ],
          };
        }),
      updateConversation: (id, lastMessage) =>
        set((state) => {
          const exists = state.conversations.some((conv) => conv.id === id);
          if (!exists) {
            // If conversation doesn't exist, create it with a default title
            const initialMessage: Message = {
              id: Date.now().toString(),
              role: 'user',
              content: lastMessage,
              timestamp: Date.now(),
            };
            
            return {
              conversations: [
                {
                  id,
                  title: lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage,
                  lastMessage,
                  updatedAt: Date.now(),
                  messages: [initialMessage],
                },
                ...state.conversations,
              ],
            };
          }
          
          return {
            conversations: state.conversations
              .map((conv) =>
                conv.id === id
                  ? { ...conv, lastMessage, updatedAt: Date.now() }
                  : conv
              )
              .sort((a, b) => b.updatedAt - a.updatedAt),
          };
        }),
      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
        })),
      getConversationMessages: (id) => {
        const conversation = get().conversations.find((conv) => conv.id === id);
        return conversation?.messages || [];
      },
      addMessage: (conversationId, role, content) =>
        set((state) => {
          const newMessage: Message = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: Date.now(),
          };
          
          return {
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, newMessage],
                    lastMessage: content,
                    updatedAt: Date.now(),
                  }
                : conv
            ).sort((a, b) => b.updatedAt - a.updatedAt),
          };
        }),
    }),
    {
      name: 'conversations-storage',
    }
  )
);
