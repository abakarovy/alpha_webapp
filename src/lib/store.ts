import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { chatApi, type Message as ApiMessage, type Conversation as ApiConversation, type ConversationContext } from './api';
import { useAuthStore } from './auth-store';

export interface MessageFile {
  id: string;
  filename: string;
  mime: string;
  size: number;
  content_base64?: string | null;
  download_url: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  files?: MessageFile[];
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  messages: Message[];
  context?: ConversationContext | null;
}

interface ConversationStore {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  addConversation: (id: string, title: string, lastMessage: string, context?: ConversationContext) => void;
  updateConversation: (id: string, lastMessage: string) => void;
  deleteConversation: (id: string) => Promise<void>;
  getConversationMessages: (id: string) => Message[];
  addMessage: (conversationId: string, role: 'user' | 'assistant', content: string, files?: MessageFile[]) => void;
  syncConversations: () => Promise<void>;
  syncConversationHistory: (conversationId: string) => Promise<void>;
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>;
  updateConversationContext: (conversationId: string, context: ConversationContext) => Promise<void>;
}

function apiMessageToLocal(apiMsg: ApiMessage, attachments?: Array<{ message_id: string; files: MessageFile[] }>): Message {
  const messageAttachments = attachments?.find(att => att.message_id === apiMsg.id);
  const files = messageAttachments?.files || [];
  
  return {
    id: apiMsg.id,
    role: apiMsg.role,
    content: apiMsg.content,
    timestamp: new Date(apiMsg.timestamp).getTime(),
    files: files.length > 0 ? files : undefined,
  };
}

function apiConversationToLocal(apiConv: ApiConversation): Conversation {
  return {
    id: apiConv.id,
    title: apiConv.title || 'New Conversation',
    lastMessage: '',
    updatedAt: new Date(apiConv.created_at).getTime(),
    messages: [],
    context: apiConv.context || null,
  };
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      isLoading: false,
      error: null,

      syncConversations: async () => {
        const authStore = useAuthStore.getState();
        if (!authStore.user) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await chatApi.getConversations(authStore.user.id);
          const localConversations = response.conversations.map(apiConversationToLocal);
          
          const conversationsWithMessages = await Promise.all(
            localConversations.map(async (conv) => {
              try {
                const history = await chatApi.getHistory(conv.id);
                return {
                  ...conv,
                  messages: history.messages.map((msg) => 
                    apiMessageToLocal(msg, history.attachments)
                  ),
                  lastMessage: history.messages.length > 0 
                    ? history.messages[history.messages.length - 1].content 
                    : '',
                };
              } catch {
                return conv;
              }
            })
          );

          set({
            conversations: conversationsWithMessages.sort((a, b) => b.updatedAt - a.updatedAt),
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to sync conversations',
            isLoading: false,
          });
        }
      },

      syncConversationHistory: async (conversationId: string) => {
        set({ isLoading: true, error: null });
        try {
          const history = await chatApi.getHistory(conversationId);
          const apiMessages = history.messages.map((msg) => 
            apiMessageToLocal(msg, history.attachments)
          );
          
          set((state) => {
            const existingConv = state.conversations.find((conv) => conv.id === conversationId);
            if (!existingConv) {
              return {
                conversations: [
                  ...state.conversations,
                  {
                    id: conversationId,
                    title: 'New Conversation',
                    lastMessage: apiMessages.length > 0 ? apiMessages[apiMessages.length - 1].content : '',
                    updatedAt: apiMessages.length > 0 ? apiMessages[apiMessages.length - 1].timestamp : Date.now(),
                    messages: apiMessages,
                  },
                ],
                isLoading: false,
              };
            }

            const mergedMessages = apiMessages.map((apiMsg) => {
              const existingMsg = existingConv.messages.find((msg) => msg.id === apiMsg.id);
              if (existingMsg && existingMsg.files && existingMsg.files.length > 0) {
                return {
                  ...apiMsg,
                  files: (apiMsg.files && apiMsg.files.length > 0) ? apiMsg.files : existingMsg.files,
                };
              }
              return apiMsg;
            });

            return {
              conversations: state.conversations.map((conv) =>
                conv.id === conversationId
                  ? {
                      ...conv,
                      messages: mergedMessages,
                      lastMessage: mergedMessages.length > 0 ? mergedMessages[mergedMessages.length - 1].content : '',
                      updatedAt: mergedMessages.length > 0 ? mergedMessages[mergedMessages.length - 1].timestamp : conv.updatedAt,
                    }
                  : conv
              ),
              isLoading: false,
            };
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to sync conversation history',
            isLoading: false,
          });
        }
      },

      addConversation: (id, title, lastMessage, context) =>
        set((state) => {
          const existingIndex = state.conversations.findIndex((conv) => conv.id === id);
          
          if (existingIndex !== -1) {
            const updated = state.conversations.map((conv, idx) =>
              idx === existingIndex
                ? { ...conv, title, lastMessage, updatedAt: Date.now(), context: context || conv.context }
                : conv
            );
            return {
              conversations: updated.sort((a, b) => b.updatedAt - a.updatedAt),
            };
          }
          
          const initialMessage: Message = {
            id: nanoid(),
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
                context: context || null,
              },
              ...state.conversations,
            ],
          };
        }),

      updateConversation: (id, lastMessage) =>
        set((state) => {
          const exists = state.conversations.some((conv) => conv.id === id);
          if (!exists) {
            const initialMessage: Message = {
              id: nanoid(),
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

      deleteConversation: async (id) => {
        const authStore = useAuthStore.getState();
        if (!authStore.user) {
          set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== id),
          }));
          return;
        }

        try {
          await chatApi.deleteConversation(id, authStore.user.id);
          set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== id),
          }));
        } catch (error) {
          set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== id),
          }));
          throw error;
        }
      },

      getConversationMessages: (id) => {
        const conversation = get().conversations.find((conv) => conv.id === id);
        return conversation?.messages || [];
      },

      addMessage: (conversationId, role, content, files?: MessageFile[]) =>
        set((state) => {
          const newMessage: Message = {
            id: nanoid(),
            role,
            content,
            timestamp: Date.now(),
            files: files && files.length > 0 ? files : undefined,
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

      updateConversationTitle: async (conversationId: string, title: string) => {
        const authStore = useAuthStore.getState();
        if (!authStore.user) {
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, title } : conv
            ),
          }));
          return;
        }

        try {
          await chatApi.updateConversationTitle(conversationId, authStore.user.id, title);
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, title } : conv
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      updateConversationContext: async (conversationId: string, context: ConversationContext) => {
        const authStore = useAuthStore.getState();
        if (!authStore.user) {
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, context } : conv
            ),
          }));
          return;
        }

        try {
          await chatApi.updateConversationContext(conversationId, context);
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, context } : conv
            ),
          }));
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'conversations-storage',
    }
  )
);
