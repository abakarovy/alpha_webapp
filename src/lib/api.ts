const API_BASE_URL = 'http://84.201.149.99:8080';

export interface ApiError {
  error: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  business_type?: string;
  full_name?: string;
  nickname?: string;
  phone?: string;
  country?: string;
  gender?: string;
  telegram_username?: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    business_type: string;
  };
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    business_type: string;
  };
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  business_type: string;
  created_at: string;
  full_name?: string | null;
  nickname?: string | null;
  phone?: string | null;
  country?: string | null;
  gender?: string | null;
  telegram_username?: string | null;
}

export interface ConversationContext {
  user_role?: 'owner' | 'marketer' | 'accountant' | 'beginner';
  business_stage?: 'startup' | 'stable' | 'scaling';
  goal?: 'increase_revenue' | 'reduce_costs' | 'hire_staff' | 'launch_ads' | 'legal_help';
  urgency?: 'urgent' | 'normal' | 'planning';
  region?: string;
  business_niche?: 'retail' | 'services' | 'food_service' | 'manufacturing' | 'online_services';
}

export interface ContextFilters {
  user_role?: string;
  business_stage?: string;
  goal?: string;
  urgency?: string;
  region?: string;
  business_niche?: string;
}

export interface ChatMessageRequest {
  message: string;
  user_id: string;
  category?: string;
  business_type?: string;
  conversation_id?: string;
  output_format?: 'xlsx' | 'csv';
  table?: {
    headers: string[];
    rows: string[][];
  };
  language?: 'en' | 'ru';
  context_filters?: ContextFilters;
}

export interface ChatMessageResponse {
  response: string;
  message_id: string;
  timestamp: string;
  conversation_id: string;
  files?: Array<{
    id: string;
    filename: string;
    mime: string;
    size: number;
    content_base64?: string;
    download_url: string;
  }>;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  context?: ConversationContext | null;
}

export interface ConversationsResponse {
  user_id: string;
  conversations: Conversation[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  conversation_id: string;
  messages: Message[];
  count: number;
  attachments?: Array<{
    message_id: string;
    files: Array<{
      id: string;
      filename: string;
      mime: string;
      size: number;
      content_base64?: string;
      download_url: string;
    }>;
  }>;
}

function getLanguage(): 'en' | 'ru' {
  try {
    const stored = localStorage.getItem('i18n-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.language || 'en';
    }
  } catch {
  }
  return 'en';
}

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  const lang = getLanguage();
  url.searchParams.set('lang', lang);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  params?: Record<string, string>
): Promise<T> {
  const url = buildUrl(endpoint, params);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': getLanguage(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiRequest<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  checkUser: async (email: string): Promise<{ exists: boolean }> => {
    return apiRequest<{ exists: boolean }>('/api/auth/check-user', {}, { email });
  },

  checkToken: async (token: string): Promise<{ valid: boolean; message: string }> => {
    return apiRequest<{ valid: boolean; message: string }>('/api/auth/check-token', {}, { token });
  },

  getProfile: async (userId: string): Promise<UserProfile> => {
    return apiRequest<UserProfile>(`/api/auth/profile/${userId}`);
  },

  updateProfile: async (token: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    return apiRequest<UserProfile>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, { token });
  },
};

export interface CreateConversationRequest {
  user_id: string;
  title?: string;
  context?: ConversationContext;
}

export interface CreateConversationResponse {
  conversation_id: string;
  created_at: string;
}

export interface UpdateContextRequest {
  user_role?: string;
  business_stage?: string;
  goal?: string;
  urgency?: string;
  region?: string;
  business_niche?: string;
}

export interface UpdateContextResponse {
  status: string;
}

export const chatApi = {
  createConversation: async (data: CreateConversationRequest): Promise<CreateConversationResponse> => {
    return apiRequest<CreateConversationResponse>('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateConversationContext: async (
    conversationId: string,
    data: UpdateContextRequest
  ): Promise<UpdateContextResponse> => {
    return apiRequest<UpdateContextResponse>(
      `/api/chat/conversations/${conversationId}/context`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  sendMessage: async (data: ChatMessageRequest): Promise<ChatMessageResponse> => {
    return apiRequest<ChatMessageResponse>('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getConversations: async (userId: string): Promise<ConversationsResponse> => {
    return apiRequest<ConversationsResponse>(`/api/chat/conversations/${userId}`);
  },

  getHistory: async (conversationId: string): Promise<ChatHistoryResponse> => {
    return apiRequest<ChatHistoryResponse>(`/api/chat/history/${conversationId}`);
  },

  deleteConversation: async (conversationId: string, userId: string): Promise<{ status: string; conversation_id: string }> => {
    return apiRequest<{ status: string; conversation_id: string }>(
      `/api/chat/conversations/${conversationId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ user_id: userId }),
      }
    );
  },

  updateConversationTitle: async (
    conversationId: string,
    userId: string,
    title: string | null
  ): Promise<{ status: string; conversation_id: string }> => {
    return apiRequest<{ status: string; conversation_id: string }>(
      `/api/chat/conversations/${conversationId}/title`,
      {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId, title }),
      }
    );
  },
};

export const fileApi = {
  download: async (fileId: string): Promise<Blob> => {
    const url = buildUrl(`/api/files/${fileId}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    return response.blob();
  },
};

