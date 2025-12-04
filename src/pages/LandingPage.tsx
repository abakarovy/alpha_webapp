import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useConversationStore } from '../lib/store';
import { useAuthStore } from '../lib/auth-store';
import { chatApi } from '../lib/api';
import { useTranslation } from '../hooks/useTranslation';

export function LandingPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addConversation, addMessage } = useConversationStore();
  const user = useAuthStore((state) => state.user);
  const { t, language } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    const message = input.trim();
    const chatId = nanoid();
    const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
    
    setIsLoading(true);
    
    try {
      const response = await chatApi.sendMessage({
        message,
        user_id: user.id,
        language: language,
      });
      
      const actualChatId = response.conversation_id;
      
      addConversation(actualChatId, title, message);
      addMessage(actualChatId, 'assistant', response.response, response.files);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      navigate(`/chat/${actualChatId}`);
    } catch (error) {
      console.error('Failed to send message:', error);
      addConversation(chatId, title, message);
      navigate(`/chat/${chatId}?message=${encodeURIComponent(message)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-1 items-center">
      <div className="w-full px-4 sm:px-10 lg:px-24">
        <div className="surface-card mx-auto max-w-3xl rounded-3xl px-4 py-8 text-center sm:px-8 sm:py-12 lg:px-12 lg:py-16 space-y-6 sm:space-y-10">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {t('landing.title')}
            </h1>
            <p className="text-xs text-gray-500 sm:text-sm lg:text-[15px]">
              {t('landing.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 px-2 sm:px-4 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('landing.placeholder')}
                disabled={isLoading}
                className="surface-input flex-1 min-w-0 rounded-2xl px-4 py-3 text-sm shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#AD2023]/60 sm:px-6 sm:py-4 sm:text-base lg:text-lg border disabled:opacity-50"
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex shrink-0 items-center justify-center rounded-xl bg-[#AD2023] p-3 text-white hover:bg-[#AD2023]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:p-4"
                aria-label={t('chat.send')}
              >
                <PaperAirplaneIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
