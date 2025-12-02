import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useConversationStore, type Message } from '../lib/store';

export function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const [searchParams] = useSearchParams();
  const initialMessage = searchParams.get('message') || '';
  
  // Subscribe to conversations to get updates
  const conversations = useConversationStore((state) => state.conversations);
  const { addMessage, addConversation } = useConversationStore();
  
  // Get messages for current conversation from store
  const currentConversation = conversations.find((conv) => conv.id === chatId);
  const storeMessages = currentConversation?.messages || [];
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages when chatId changes or store updates
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    if (storeMessages.length > 0) {
      // Load existing messages from store
      setMessages(storeMessages);
    } else if (initialMessage) {
      // New conversation with initial message
      const title = initialMessage.length > 30 ? initialMessage.substring(0, 30) + '...' : initialMessage;
      addConversation(chatId, title, initialMessage);
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: initialMessage,
        timestamp: Date.now(),
      };
      setMessages([newMessage]);
    } else {
      // Empty conversation
      setMessages([]);
    }
    
    setInput('');
  }, [chatId, storeMessages.length, initialMessage]); // Reload when chatId or store messages change

  // Sync messages when store updates
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    // Update local state immediately for better UX
    setMessages((prev) => [...prev, newMessage]);
    
    // Save to store (this will trigger store update and sync)
    addMessage(chatId, 'user', input.trim());
    
    setInput('');

    // API: Send message to backend here
    // For now, simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a placeholder response. Backend integration coming soon.',
        timestamp: Date.now(),
      };
      // Update local state
      setMessages((prev) => [...prev, assistantMessage]);
      // Save assistant message to store
      addMessage(chatId, 'assistant', assistantMessage.content);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#050509]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-gray-300">
                  Start a conversation
                </h2>
                <p className="text-sm text-gray-500">
                  Send a message to begin chatting
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
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#AD2023] text-white rounded-br-none'
                      : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 bg-black/40 px-6 py-4 sm:px-10 sm:py-6">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSend}>
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 rounded-2xl bg-white/5 px-5 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#AD2023]/50 border border-white/10"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-xl bg-[#AD2023] px-5 py-3 text-sm font-medium text-white hover:bg-[#AD2023]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
