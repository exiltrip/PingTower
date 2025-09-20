import { api } from '@/shared/api/privateApi';

export interface NotificationChannel {
  id: number;
  userId: number;
  type: 'webhook' | 'telegram';
  name: string;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelRequest {
  name: string;
  type: 'webhook' | 'telegram';
  config: Record<string, any>;
}

export interface TelegramLinkingResponse {
  linking_code: string;
}

/**
 * Получает все каналы уведомлений пользователя
 */
export async function getNotificationChannels(): Promise<NotificationChannel[]> {
  const response = await api.get('/api/v1/notifications/channels');
  return response.data;
}

/**
 * Создает новый канал уведомлений
 */
export async function createNotificationChannel(data: CreateChannelRequest): Promise<NotificationChannel> {
  const response = await api.post('/api/v1/notifications/channels', data);
  return response.data;
}

/**
 * Удаляет канал уведомлений
 */
export async function deleteNotificationChannel(channelId: number): Promise<void> {
  await api.delete(`/api/v1/notifications/channels/${channelId}`);
}

/**
 * Генерирует код для привязки Telegram аккаунта
 */
export async function generateTelegramLinkingCode(): Promise<TelegramLinkingResponse> {
  const response = await api.post('/api/v1/notifications/channels/telegram/initiate');
  return response.data;
}

/**
 * Создает webhook канал
 */
export async function createWebhookChannel(name: string, url: string): Promise<NotificationChannel> {
  return createNotificationChannel({
    name,
    type: 'webhook',
    config: { url }
  });
}

/**
 * Создает Telegram канал после успешной привязки
 */
export async function createTelegramChannel(name: string): Promise<NotificationChannel> {
  return createNotificationChannel({
    name,
    type: 'telegram',
    config: {} // Telegram config заполняется на бэкенде после привязки
  });
}
