import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useConversationStore } from '../lib/store';
import { useAuthStore } from '../lib/auth-store';
import { chatApi, type ConversationContext } from '../lib/api';
import { useTranslation } from '../hooks/useTranslation';
import { ContextModal } from '../components/ContextModal';

export function LandingPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [context, setContext] = useState<ConversationContext | undefined>(undefined);
  const navigate = useNavigate();
  const { addConversation } = useConversationStore();
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  const handleContextSave = (newContext: ConversationContext) => {
    setContext(newContext);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    const message = input.trim();
    const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
    
    setIsLoading(true);
    
    try {
      let conversationId: string;
      
      if (context && Object.keys(context).length > 0) {
        const createResponse = await chatApi.createConversation({
          user_id: user.id,
          title,
          context,
        });
        conversationId = createResponse.conversation_id;
      } else {
        conversationId = nanoid();
      }

      addConversation(conversationId, title, message, context);
      
      navigate(`/chat/${conversationId}?message=${encodeURIComponent(message)}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      const fallbackId = nanoid();
      addConversation(fallbackId, title, message, context);
      navigate(`/chat/${fallbackId}?message=${encodeURIComponent(message)}`);
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

  const quickMessages = [
    { key: 'landing.quickMessages.createMarketingPlan', value: t('landing.quickMessages.createMarketingPlan') },
    { key: 'landing.quickMessages.analyzeRevenue', value: t('landing.quickMessages.analyzeRevenue') },
    { key: 'landing.quickMessages.optimizeCosts', value: t('landing.quickMessages.optimizeCosts') },
    { key: 'landing.quickMessages.hireTeam', value: t('landing.quickMessages.hireTeam') },
    { key: 'landing.quickMessages.launchAds', value: t('landing.quickMessages.launchAds') },
  ];

  const handleQuickMessage = async (message: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    const title = message.length > 30 ? message.substring(0, 30) + '...' : message;

    try {
      let conversationId: string;

      if (context && Object.keys(context).length > 0) {
        const createResponse = await chatApi.createConversation({
          user_id: user.id,
          title,
          context,
        });
        conversationId = createResponse.conversation_id;
      } else {
        conversationId = nanoid();
      }

      addConversation(conversationId, title, message, context);
      navigate(`/chat/${conversationId}?message=${encodeURIComponent(message)}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      const fallbackId = nanoid();
      addConversation(fallbackId, title, message, context);
      navigate(`/chat/${fallbackId}?message=${encodeURIComponent(message)}`);
    } finally {
      setIsLoading(false);
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

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 px-2 sm:px-4 lg:px-8 space-y-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {quickMessages.map((message) => (
                <button
                  key={message.key}
                  type="button"
                  onClick={() => handleQuickMessage(message.value)}
                  disabled={isLoading}
                  className="quick-message-btn px-4 py-2 rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {message.value}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsContextModalOpen(true)}
                className={`flex shrink-0 items-center justify-center rounded-xl p-3 transition-colors sm:p-4 ${
                  context && Object.keys(context).length > 0
                    ? 'bg-[#AD2023] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 context-button'
                }`}
                aria-label={t('context.edit')}
                title={t('context.edit')}
              >
                <Cog6ToothIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
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
                className="send-button flex shrink-0 items-center justify-center rounded-xl bg-[#AD2023] p-3 text-white hover:bg-[#AD2023]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:p-4"
                aria-label={t('chat.send')}
              >
                <PaperAirplaneIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </form>
        </div>
      </div>
      <ContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        onSave={handleContextSave}
        initialContext={context}
      />
    </div>
  );
}
