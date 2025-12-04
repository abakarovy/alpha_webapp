import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import {
  MegaphoneIcon,
  ShoppingCartIcon,
  LightBulbIcon,
  LifebuoyIcon,
  UserGroupIcon,
  ChartBarIcon,
  BanknotesIcon,
  BriefcaseIcon,
  CogIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  HeartIcon,
  AcademicCapIcon,
  HomeIcon,
  CakeIcon,
  TruckIcon,
  DocumentTextIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../hooks/useTranslation';
import { templateCategories } from '../lib/templates';
import { useConversationStore } from '../lib/store';
import { useAuthStore } from '../lib/auth-store';
import { chatApi } from '../lib/api';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MegaphoneIcon,
  ShoppingCartIcon,
  LightBulbIcon,
  LifebuoyIcon,
  UserGroupIcon,
  ChartBarIcon,
  BanknotesIcon,
  BriefcaseIcon,
  CogIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  HeartIcon,
  AcademicCapIcon,
  HomeIcon,
  CakeIcon,
  TruckIcon,
  DocumentTextIcon,
  ChartPieIcon,
};

export function TemplatesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addConversation } = useConversationStore();
  const user = useAuthStore((state) => state.user);

  const handleTemplateClick = async (templateTitle: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const title = templateTitle.length > 30 ? templateTitle.substring(0, 30) + '...' : templateTitle;
    let conversationId: string;

    try {
      const createResponse = await chatApi.createConversation({
        user_id: user.id,
        title,
      });
      conversationId = createResponse.conversation_id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      conversationId = nanoid();
    }

    addConversation(conversationId, title, templateTitle);
    navigate(`/chat/${conversationId}?message=${encodeURIComponent(templateTitle)}`);
  };

  return (
    <div className="chat-shell flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-2xl font-semibold">
            {t('templates.title')}
          </h1>
          
          <div className="space-y-8">
            {templateCategories.map((category) => {
              const IconComponent = iconMap[category.icon] || ChartBarIcon;
              
              return (
                <div key={category.name} className="surface-card rounded-2xl px-6 py-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div style={{ color: category.color }}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                    </div>
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {category.templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateClick(template.title)}
                        className="group rounded-lg border border-white/10 bg-white/5 p-4 text-left transition-all hover:bg-white/10 hover:border-white/20"
                      >
                        <p className="text-sm text-gray-300 group-hover:text-white">
                          {template.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
