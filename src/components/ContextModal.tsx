import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../hooks/useTranslation';
import type { ConversationContext } from '../lib/api';
import { CustomSelect } from './CustomSelect';

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (context: ConversationContext) => void;
  initialContext?: ConversationContext | null;
}

export function ContextModal({ isOpen, onClose, onSave, initialContext }: ContextModalProps) {
  const { t } = useTranslation();
  const [context, setContext] = useState<ConversationContext>({
    user_role: undefined,
    business_stage: undefined,
    goal: undefined,
    urgency: undefined,
    region: '',
    business_niche: undefined,
  });

  useEffect(() => {
    if (isOpen) {
      setContext(initialContext || {
        user_role: undefined,
        business_stage: undefined,
        goal: undefined,
        urgency: undefined,
        region: '',
        business_niche: undefined,
      });
    }
  }, [isOpen, initialContext]);

  if (!isOpen) return null;

  const handleSave = () => {
    const cleanedContext: ConversationContext = {};
    if (context.user_role) cleanedContext.user_role = context.user_role;
    if (context.business_stage) cleanedContext.business_stage = context.business_stage;
    if (context.goal) cleanedContext.goal = context.goal;
    if (context.urgency) cleanedContext.urgency = context.urgency;
    if (context.region?.trim()) cleanedContext.region = context.region.trim();
    if (context.business_niche) cleanedContext.business_niche = context.business_niche;
    
    onSave(cleanedContext);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="surface-card relative z-10 w-full max-w-2xl rounded-2xl p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t('context.title')}</h2>
            <p className="mt-1 text-sm text-gray-500">{t('context.description')}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">{t('context.userRole')}</label>
            <CustomSelect
              value={context.user_role || ''}
              onChange={(value) => setContext({ ...context, user_role: (value || undefined) as any })}
              placeholder={t('context.selectUserRole')}
              options={[
                { value: 'owner', label: t('context.owner') },
                { value: 'marketer', label: t('context.marketer') },
                { value: 'accountant', label: t('context.accountant') },
                { value: 'beginner', label: t('context.beginner') },
              ]}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t('context.businessStage')}</label>
            <CustomSelect
              value={context.business_stage || ''}
              onChange={(value) => setContext({ ...context, business_stage: (value || undefined) as any })}
              placeholder={t('context.selectBusinessStage')}
              options={[
                { value: 'startup', label: t('context.startup') },
                { value: 'stable', label: t('context.stable') },
                { value: 'scaling', label: t('context.scaling') },
              ]}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t('context.goal')}</label>
            <CustomSelect
              value={context.goal || ''}
              onChange={(value) => setContext({ ...context, goal: (value || undefined) as any })}
              placeholder={t('context.selectGoal')}
              options={[
                { value: 'increase_revenue', label: t('context.increaseRevenue') },
                { value: 'reduce_costs', label: t('context.reduceCosts') },
                { value: 'hire_staff', label: t('context.hireStaff') },
                { value: 'launch_ads', label: t('context.launchAds') },
                { value: 'legal_help', label: t('context.legalHelp') },
              ]}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t('context.urgency')}</label>
            <CustomSelect
              value={context.urgency || ''}
              onChange={(value) => setContext({ ...context, urgency: (value || undefined) as any })}
              placeholder={t('context.selectUrgency')}
              options={[
                { value: 'urgent', label: t('context.urgent') },
                { value: 'normal', label: t('context.normal') },
                { value: 'planning', label: t('context.planning') },
              ]}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t('context.region')}</label>
            <CustomSelect
              value={context.region || ''}
              onChange={(value) => setContext({ ...context, region: value })}
              placeholder={t('context.selectRegion')}
              options={[
                { value: 'russia', label: t('auth.russia') },
                { value: 'america', label: t('auth.america') },
                { value: 'britain', label: t('auth.britain') },
              ]}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t('context.businessNiche')}</label>
            <CustomSelect
              value={context.business_niche || ''}
              onChange={(value) => setContext({ ...context, business_niche: (value || undefined) as any })}
              placeholder={t('context.selectBusinessNiche')}
              options={[
                { value: 'retail', label: t('context.retail') },
                { value: 'services', label: t('context.services') },
                { value: 'food_service', label: t('context.foodService') },
                { value: 'manufacturing', label: t('context.manufacturing') },
                { value: 'online_services', label: t('context.onlineServices') },
              ]}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-white/5"
          >
            {t('context.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-[#AD2023] px-4 py-2 text-sm font-medium text-white hover:bg-[#AD2023]/90"
          >
            {t('context.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

