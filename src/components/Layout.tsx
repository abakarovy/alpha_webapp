import { useEffect, useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useConversationStore } from '../lib/store';
import { useAuthStore } from '../lib/auth-store';
import { useTranslation } from '../hooks/useTranslation';
import {
  ChatBubbleLeftIcon,
  TrashIcon,
  HomeIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { conversations, deleteConversation, syncConversations } = useConversationStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      syncConversations();
    }
  }, [isAuthenticated, user, syncConversations]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isChatActive = (chatId: string) => {
    return location.pathname === `/chat/${chatId}`;
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteConversation(id);
      if (location.pathname === `/chat/${id}`) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-screen">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`sidebar-shell fixed left-0 top-0 z-50 h-full w-64 flex-col border-r px-6 py-8 transition-transform duration-300 sm:relative sm:z-auto sm:flex ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <div className="mb-6 flex items-center justify-between sm:justify-center">
          <div className="text-sm font-semibold tracking-tight text-gray-200 flex justify-center">
            <img src='https://alfabank.servicecdn.ru/site-upload/31/99/10565/D_red_logo.svg'/>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="sm:hidden text-gray-400 hover:text-gray-200"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-6 text-sm font-semibold tracking-tight text-gray-200 flex justify-center">
          <img src='https://alfabank.servicecdn.ru/site-upload/31/99/10565/D_red_logo.svg'/>
        </div>
        
        <nav className="space-y-2 text-xs text-gray-500">
          <Link
            to="/"
            onClick={handleLinkClick}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
              isActive('/') && location.pathname !== '/settings' && location.pathname !== '/templates'
                ? 'bg-white/10 text-[#AD2023] dark:text-[#AD2023]'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <HomeIcon className="h-4 w-4 text-[#AD2023]" />
            <span>{t('nav.home')}</span>
          </Link>
          <Link
            to="/templates"
            onClick={handleLinkClick}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
              isActive('/templates')
                ? 'bg-white/10 text-[#AD2023] dark:text-[#AD2023]'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <Squares2X2Icon className="h-4 w-4 text-[#AD2023]" />
            <span>{t('nav.templates')}</span>
          </Link>
        </nav>

        <div className="mt-6 flex-1 overflow-y-auto">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
            {t('nav.conversations')}
          </div>
          <div className="space-y-1">
            {conversations.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-600">
                {t('nav.noConversations')}
              </div>
            ) : (
              conversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  onClick={handleLinkClick}
                  className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                    isChatActive(conv.id)
                      ? 'bg-white/10 text-[#AD2023] dark:text-[#AD2023]'
                      : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                    title={t('nav.deleteConversation')}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-2">
          <Link
            to="/settings"
            onClick={handleLinkClick}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
              isActive('/settings')
                ? 'bg-white/10 text-[#AD2023] dark:text-[#AD2023]'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <Cog6ToothIcon className="h-4 w-4 text-[#AD2023]" />
            <span>{t('nav.settings')}</span>
          </Link>
          
          {isAuthenticated && user ? (
            <div className="space-y-2">
              <Link
                to="/profile"
                onClick={handleLinkClick}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                  isActive('/profile')
                    ? 'bg-white/10 text-[#AD2023] dark:text-[#AD2023]'
                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <UserIcon className="h-4 w-4 text-[#AD2023]" />
                <span className="truncate">{t('profile.title')}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-200"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 text-[#AD2023]" />
                <span>{t('auth.logout')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={handleLinkClick}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-200"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 text-[#AD2023]" />
                <span>{t('auth.login')}</span>
              </Link>
              <Link
                to="/register"
                onClick={handleLinkClick}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-200"
              >
                <UserIcon className="h-4 w-4 text-[#AD2023]" />
                <span>{t('auth.register')}</span>
              </Link>
            </div>
          )}
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed left-4 top-4 z-30 rounded-lg bg-[#AD2023] p-2 text-white shadow-lg sm:hidden"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <Outlet />
      </main>
    </div>
  );
}
