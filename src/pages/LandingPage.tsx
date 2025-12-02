import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { useConversationStore } from '../lib/store';

export function LandingPage() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const { addConversation } = useConversationStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const chatId = nanoid();
    const message = input.trim();
    const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
    
    // Add conversation to store
    addConversation(chatId, title, message);
    
    // API: Store initial message in state/store when backend is ready
    navigate(`/chat/${chatId}?message=${encodeURIComponent(message)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-1 items-center">
      <div className="w-full px-10 sm:px-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/5 bg-black/40 px-8 py-12 text-center shadow-[0_22px_80px_rgba(0,0,0,0.9)] sm:px-12 sm:py-16 space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-100 sm:text-4xl">
              Smile AI
            </h1>
            <p className="text-sm text-gray-500 sm:text-[15px]">
              Your business assistant UI. Backend and AI will plug in later.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 px-4 sm:px-8">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your business..."
              className="w-full rounded-2xl bg-white/5 px-6 py-4 text-base text-gray-100 shadow-[0_18px_60px_rgba(0,0,0,0.85)] placeholder:text-gray-500 focus:outline-none sm:text-lg"
              autoFocus
            />
          </form>
        </div>
      </div>
    </div>
  );
}
