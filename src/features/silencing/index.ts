// Главный экспорт модуля silencing

// API функции
export * from './api';

// UI компоненты
export {
  SilencingRulesSimple,
  QuickSilenceButton,
  SilencingStatus as SilencingStatusComponent
} from './ui';

// Типы
export type {
  SilencingRule,
  SilencingMatcher,
  SilencingTarget,
  CreateSilencingRuleRequest,
  UpdateSilencingRuleRequest,
  QuickSilenceRequest,
  SilencingStatus as SilencingStatusType,
  AddTargetToRuleRequest,
  SilencingRulesFilter,
  SilencingRulesSortOptions,
  SilencingRuleStatus
} from '../../entities/silencing/types';

export {
  getSilencingRuleStatus,
  formatSilencingDuration
} from '../../entities/silencing/types';
