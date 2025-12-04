import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Cog6ToothIcon, StopIcon } from '@heroicons/react/24/outline';
import { useConversationStore, type Message } from '../lib/store';
import { useAuthStore } from '../lib/auth-store';
import { chatApi, type ConversationContext } from '../lib/api';
import { useTranslation } from '../hooks/useTranslation';
import { ContextModal } from '../components/ContextModal';
import { TypewriterMessage } from '../components/TypewriterMessage';

function removeJsonCodeBlocks(content: string): string {
  return content.replace(/```json[\s\S]*?```/g, '');
}

export function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMessage = searchParams.get('message') || '';
  const { t, language } = useTranslation();
  
  const user = useAuthStore((state) => state.user);
  const conversations = useConversationStore((state) => state.conversations);
  const { addMessage, syncConversationHistory, isLoading, updateConversationContext } = useConversationStore();
  
  const currentConversation = conversations.find((conv) => conv.id === chatId);
  const storeMessages = React.useMemo(() => currentConversation?.messages || [], [currentConversation]);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [isTypingStopped, setIsTypingStopped] = useState(false);
  const hasSentInitialRef = useRef(false);
  const isSendingInitialRef = useRef(false);
  const isSyncingRef = useRef(false);
  const justAddedMessageRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
  }, [user, navigate]);

  const sendInitialMessage = async (messageText: string) => {
    if (!chatId || !user || isSending) return;
    
    if (isSendingInitialRef.current) {
      return;
    }

    isSendingInitialRef.current = true;
    setIsSending(true);

    try {
      const contextFilters = currentConversation?.context ? {
        user_role: currentConversation.context.user_role,
        business_stage: currentConversation.context.business_stage,
        goal: currentConversation.context.goal,
        urgency: currentConversation.context.urgency,
        region: currentConversation.context.region,
        business_niche: currentConversation.context.business_niche,
      } : undefined;

      const response = await chatApi.sendMessage({
        message: messageText,
        user_id: user.id,
        conversation_id: chatId,
        language: language,
        context_filters: contextFilters,
      });

      const assistantMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp).getTime(),
        files: response.files && response.files.length > 0 ? response.files : undefined,
      };

      setTypingMessageId(response.message_id);
      setIsTypingStopped(false);
      justAddedMessageRef.current = response.message_id;
      
      setMessages((prev) => {
        const existingIds = new Set(prev.map(m => m.id));
        if (existingIds.has(response.message_id)) {
          return prev;
        }
        return [...prev, assistantMessage];
      });
      
      addMessage(chatId, 'assistant', response.response, response.files);
      
      setTimeout(() => {
        justAddedMessageRef.current = null;
      }, 2000);
    } catch (error) {
      console.error('Failed to send initial message:', error);
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Failed to send message',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      isSendingInitialRef.current = false;
    }
  };

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      hasSentInitialRef.current = false;
      isSendingInitialRef.current = false;
      setTypingMessageId(null);
      setIsTypingStopped(false);
      return;
    }

    const hasAssistantResponse = storeMessages.some(msg => msg.role === 'assistant');
    const userMessageInStore = storeMessages.find(msg => msg.role === 'user' && msg.content === initialMessage);

    if (initialMessage && !hasSentInitialRef.current && !hasAssistantResponse) {
      if (userMessageInStore) {
        setMessages(storeMessages);
      } else {
        const userMessage: Message = {
          id: nanoid(),
          role: 'user',
          content: initialMessage,
          timestamp: Date.now(),
        };
        setMessages([userMessage]);
      }
      hasSentInitialRef.current = true;
      
      if (user && !isSendingInitialRef.current && !userMessageInStore) {
        addMessage(chatId, 'user', initialMessage);
        const messageToSend = initialMessage;
        setTimeout(() => {
          sendInitialMessage(messageToSend);
        }, 200);
      } else if (user && !isSendingInitialRef.current && userMessageInStore && !hasAssistantResponse) {
        const messageToSend = initialMessage;
        setTimeout(() => {
          sendInitialMessage(messageToSend);
        }, 200);
      }
      setInput('');
      return;
    }

    if (storeMessages.length > 0 && !initialMessage) {
      setMessages(storeMessages);
      hasSentInitialRef.current = true;
      setInput('');
      return;
    }

    if (!initialMessage) {
      if (user) {
        syncConversationHistory(chatId);
      } else {
        setMessages([]);
        hasSentInitialRef.current = true;
      }
    }
    
    setInput('');
  }, [chatId, initialMessage, user, storeMessages]);

  useEffect(() => {
    if (!chatId || isSending || isSyncingRef.current || typingMessageId || initialMessage || justAddedMessageRef.current) return;
    
    if (storeMessages.length > 0) {
      setMessages((prevMessages) => {
        if (prevMessages.length === 0) {
          return storeMessages;
        }
        
        const localMessageIds = new Set(prevMessages.map(m => m.id));
        const storeMessageIds = new Set(storeMessages.map(m => m.id));
        
        const allLocalInStore = prevMessages.every(m => storeMessageIds.has(m.id));
        const storeHasNewMessages = storeMessages.some(m => !localMessageIds.has(m.id));
        
        if (storeHasNewMessages && allLocalInStore) {
          return storeMessages;
        } else if (storeHasNewMessages && !allLocalInStore) {
          const merged = [...prevMessages];
          storeMessages.forEach(storeMsg => {
            if (!localMessageIds.has(storeMsg.id)) {
              merged.push(storeMsg);
            }
          });
          merged.sort((a, b) => a.timestamp - b.timestamp);
          return merged;
        }
        return prevMessages;
      });
    }
  }, [chatId, storeMessages, isSending, typingMessageId, initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chatId]);

  const handleContextSave = async (newContext: ConversationContext) => {
    if (!chatId) return;
    try {
      await updateConversationContext(chatId, newContext);
    } catch (error) {
      console.error('Failed to update context:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId || isSending || !user) return;

    const messageText = input.trim();
    setInput('');
    setIsSending(true);

    const newMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    addMessage(chatId, 'user', messageText);

    try {
      const contextFilters = currentConversation?.context ? {
        user_role: currentConversation.context.user_role,
        business_stage: currentConversation.context.business_stage,
        goal: currentConversation.context.goal,
        urgency: currentConversation.context.urgency,
        region: currentConversation.context.region,
        business_niche: currentConversation.context.business_niche,
      } : undefined;

      const response = await chatApi.sendMessage({
        message: messageText,
        user_id: user.id,
        conversation_id: chatId,
        language: language,
        context_filters: contextFilters,
      });

      const assistantMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp).getTime(),
        files: response.files && response.files.length > 0 ? response.files : undefined,
      };

      setTypingMessageId(response.message_id);
      setIsTypingStopped(false);
      justAddedMessageRef.current = response.message_id;
      
      setMessages((prev) => {
        const existingIds = new Set(prev.map(m => m.id));
        if (existingIds.has(response.message_id)) {
          return prev;
        }
        return [...prev, assistantMessage];
      });
      
      addMessage(chatId, 'assistant', response.response, response.files);
      
      setTimeout(() => {
        justAddedMessageRef.current = null;
      }, 2000);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Failed to send message',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleStop = () => {
    setIsTypingStopped(true);
    setTypingMessageId(null);
  };

  const handleTypingComplete = () => {
    setTypingMessageId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="chat-shell flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          {isLoading && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="text-sm text-gray-500">{t('auth.loading')}</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-gray-300">
                  {t('chat.emptyTitle')}
                </h2>
                <p className="text-sm text-gray-500">
                  {t('chat.emptySubtitle')}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 space-y-2 ${
                    message.role === 'user'
                      ? 'chat-bubble-user rounded-br-none'
                      : 'chat-bubble-assistant rounded-bl-none'
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    {message.role === 'assistant' && typingMessageId === message.id ? (
                      <TypewriterMessage
                        content={message.content}
                        isStopped={isTypingStopped}
                        onComplete={handleTypingComplete}
                      />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({ node, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const isJson = match && match[1] === 'json';
                            if (isJson) {
                              return null;
                            }
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-4">
                              <table className="min-w-full border-collapse border border-white/20">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-white/10">{children}</thead>
                          ),
                          tbody: ({ children }) => (
                            <tbody className="divide-y divide-white/10">{children}</tbody>
                          ),
                          tr: ({ children }) => (
                            <tr className="border-b border-white/10">{children}</tr>
                          ),
                          th: ({ children }) => (
                            <th className="px-4 py-2 text-left font-semibold border border-white/20">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-4 py-2 border border-white/20">
                              {children}
                            </td>
                          ),
                          p: ({ children }) => (
                            <p className="text-sm leading-relaxed mb-2 last:mb-0">
                              {children}
                            </p>
                          ),
                          pre: ({ children }) => {
                            const hasJsonCode = React.Children.toArray(children).some((child: any) => {
                              return child?.props?.className?.includes('language-json');
                            });
                            if (hasJsonCode) {
                              return null;
                            }
                            return <pre className="bg-white/5 p-3 rounded-lg overflow-x-auto my-2">{children}</pre>;
                          },
                        }}
                      >
                        {removeJsonCodeBlocks(message.content)}
                      </ReactMarkdown>
                    )}
                  </div>
                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                      {message.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"
                        >
                          <svg
                            className="h-5 w-5 text-[#AD2023]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{file.filename}</p>
                            <p className="text-xs text-gray-400">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <a
                            href={file.content_base64 
                              ? `data:${file.mime};base64,${file.content_base64}`
                              : `https://alpha-backend-c91h.onrender.com${file.download_url}`
                            }
                            download={file.filename}
                            className="rounded px-2 py-1 text-xs font-medium text-[#AD2023] hover:bg-white/10 transition-colors"
                          >
                            {t('chat.download')}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="flex justify-start">
              <div className="chat-bubble-assistant max-w-[80%] rounded-2xl rounded-bl-none px-5 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-bar border-t px-6 py-4 sm:px-10 sm:py-6">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSend}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsContextModalOpen(true)}
                className={`flex shrink-0 items-center justify-center rounded-xl p-3 transition-colors ${
                  currentConversation?.context && Object.keys(currentConversation.context).length > 0
                    ? 'bg-[#AD2023] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 context-button'
                }`}
                aria-label={t('context.edit')}
                title={t('context.edit')}
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.inputPlaceholder')}
                disabled={isSending}
                className="surface-input flex-1 rounded-2xl px-5 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50 border disabled:opacity-50"
              />
              {typingMessageId ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="send-button flex shrink-0 items-center justify-center rounded-xl bg-[#AD2023] p-3 text-white hover:bg-[#AD2023]/90 transition-colors"
                  aria-label={t('chat.stop')}
                >
                  <StopIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="send-button flex shrink-0 items-center justify-center rounded-xl bg-[#AD2023] p-3 text-white hover:bg-[#AD2023]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('chat.send')}
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <ContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        onSave={handleContextSave}
        initialContext={currentConversation?.context || null}
      />
    </div>
  );
}
