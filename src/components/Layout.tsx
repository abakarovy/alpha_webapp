import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useConversationStore } from '../lib/store';
import { ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { conversations, deleteConversation } = useConversationStore();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isChatActive = (chatId: string) => {
    return location.pathname === `/chat/${chatId}`;
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    deleteConversation(id);
    if (location.pathname === `/chat/${id}`) {
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#050509] text-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-black/40 px-6 py-8 sm:flex">
        <div className="mb-6 text-sm font-semibold tracking-tight text-gray-200">
          Smile AI
        </div>
        
        {/* Main nav items */}
        <nav className="space-y-2 text-xs text-gray-500">
          <Link
            to="/"
            className={`block rounded-lg px-3 py-2 transition-colors ${
              isActive('/') && location.pathname !== '/settings' && location.pathname !== '/templates'
                ? 'bg-white/10 text-gray-200'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            Home
          </Link>
          <Link
            to="/templates"
            className={`block rounded-lg px-3 py-2 transition-colors ${
              isActive('/templates')
                ? 'bg-white/10 text-gray-200'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            Templates
          </Link>
        </nav>

        {/* Conversations section */}
        <div className="mt-6 flex-1 overflow-y-auto">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
            Conversations
          </div>
          <div className="space-y-1">
            {conversations.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-600">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                    isChatActive(conv.id)
                      ? 'bg-white/10 text-gray-200'
                      : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                    title="Delete conversation"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Settings at bottom */}
        <div className="border-t border-white/10 pt-4">
          <Link
            to="/settings"
            className={`block rounded-lg px-3 py-2 text-xs transition-colors ${
              isActive('/settings')
                ? 'bg-white/10 text-gray-200'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
