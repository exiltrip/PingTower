export interface SilencingRule {
  id: number;
  name: string;
  userId: number;
  isActive: boolean;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  silenceType: 'maintenance' | 'temporary' | 'scheduled';
  config: {
    description?: string;
    notifyOnStart?: boolean;
    notifyOnEnd?: boolean;
  };
  recurringPattern?: {
    type: 'weekly' | 'daily' | 'custom';
    days?: string[];
    startTime?: string;
    duration?: number;
    timezone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SilencingTarget {
  id: number;
  ruleId: number;
  targetType: 'check' | 'tag' | 'all';
  targetValue: string;
  description?: string;
}

export interface CreateSilencingRuleRequest {
  name: string;
  userId: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  silenceType: 'maintenance' | 'temporary' | 'scheduled';
  config: {
    description?: string;
    notifyOnStart?: boolean;
    notifyOnEnd?: boolean;
  };
  recurringPattern?: {
    type: 'weekly' | 'daily' | 'custom';
    days?: string[];
    startTime?: string;
    duration?: number;
    timezone?: string;
  };
}

export interface UpdateSilencingRuleRequest extends Partial<CreateSilencingRuleRequest> {}

export interface QuickSilenceRequest {
  checkId: number;
  duration: number; // в минутах
  reason?: string;
}

export interface SilencingStatus {
  checkId: number;
  isSilenced: boolean;
  activeSilencingRules: Pick<SilencingRule, 'id' | 'name' | 'endsAt'>[];
}

export interface AddTargetToRuleRequest {
  targetType: SilencingTarget['targetType'];
  targetValue: string;
  description?: string;
}

// Типы для фильтрации и сортировки
export interface SilencingRulesFilter {
  isActive?: boolean;
  searchQuery?: string;
  targetType?: SilencingTarget['targetType'];
}

export interface SilencingRulesSortOptions {
  field: 'name' | 'createdAt' | 'startTime' | 'endTime';
  direction: 'asc' | 'desc';
}

// Статусы для UI
export type SilencingRuleStatus = 'active' | 'scheduled' | 'expired' | 'inactive';

export const getSilencingRuleStatus = (rule: SilencingRule): SilencingRuleStatus => {
  const now = new Date();
  const startsAt = new Date(rule.startTime);
  const endsAt = new Date(rule.endTime);

  if (!rule.isActive) {
    return 'inactive';
  }

  if (now < startsAt) {
    return 'scheduled';
  }

  if (now > endsAt) {
    return 'expired';
  }

  return 'active';
};

export const formatSilencingDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} дн. ${hours % 24} ч.`;
  } else if (hours > 0) {
    return `${hours} ч. ${minutes % 60} мин.`;
  } else {
    return `${minutes} мин.`;
  }
};
