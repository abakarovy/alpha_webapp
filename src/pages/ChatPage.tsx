import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useConversationStore, type Message } from '../lib/store';
import { useAuthStore } from '../lib/auth-store';
import { chatApi } from '../lib/api';
import { useTranslation } from '../hooks/useTranslation';

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
  const { addMessage, addConversation, syncConversationHistory, isLoading } = useConversationStore();
  
  const currentConversation = conversations.find((conv) => conv.id === chatId);
  const storeMessages = currentConversation?.messages || [];
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const hasSentInitialRef = useRef(false);
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

    setIsSending(true);

    try {
      const response = await chatApi.sendMessage({
        message: messageText,
        user_id: user.id,
        conversation_id: chatId,
        language: language,
      });

      const assistantMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp).getTime(),
        files: response.files && response.files.length > 0 ? response.files : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      addMessage(chatId, 'assistant', response.response, response.files);

      await new Promise(resolve => setTimeout(resolve, 100));
      await syncConversationHistory(chatId);
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
    }
  };

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      hasSentInitialRef.current = false;
      return;
    }

    hasSentInitialRef.current = false;

    if (storeMessages.length > 0) {
      setMessages(storeMessages);
      hasSentInitialRef.current = true;
    } else {
      if (initialMessage) {
        const title = initialMessage.length > 30 ? initialMessage.substring(0, 30) + '...' : initialMessage;
        addConversation(chatId, title, initialMessage);
        const newMessage: Message = {
          id: nanoid(),
          role: 'user',
          content: initialMessage,
          timestamp: Date.now(),
        };
        setMessages([newMessage]);
        
        if (user) {
          hasSentInitialRef.current = true;
          setTimeout(() => {
            sendInitialMessage(initialMessage);
          }, 0);
        }
      } else {
        if (user) {
          syncConversationHistory(chatId);
        }
      }
    }
    
    setInput('');
  }, [chatId, initialMessage, user, storeMessages.length]);

  useEffect(() => {
    if (chatId && storeMessages.length > 0) {
      setMessages(storeMessages);
    }
  }, [chatId, storeMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chatId]);

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
      const response = await chatApi.sendMessage({
        message: messageText,
        user_id: user.id,
        conversation_id: chatId,
        language: language,
      });

      const assistantMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp).getTime(),
        files: response.files && response.files.length > 0 ? response.files : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      addMessage(chatId, 'assistant', response.response, response.files);

      await new Promise(resolve => setTimeout(resolve, 100));
      await syncConversationHistory(chatId);
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
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="rounded-xl bg-[#AD2023] px-5 py-3 text-sm font-medium text-white hover:bg-[#AD2023]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('chat.send')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
