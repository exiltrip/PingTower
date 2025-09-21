import React, { useState, useEffect, Suspense } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Divider, 
  message, 
  Avatar, 
  Space,
  Alert,
  InputNumber,
  Tooltip,
  TimePicker,
  Tabs
} from 'antd';
import { 
  UserOutlined, 
  SaveOutlined,
  BellOutlined,
  MutedOutlined,
  LockOutlined,
  InfoCircleOutlined,
  SecurityScanOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import Loading from '@/shared/ui/Loading';

// Lazy load компонента сайленсинга
const SilencingRulesManagement = React.lazy(() => import('../../silencing/ui/SilencingRulesSimple'));

const { Option } = Select;
const { Password } = Input;

interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

interface GlobalSettings {
  defaultNotificationDelay: number;
  enableEmailDigest: boolean;
  digestFrequency: 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  timezone: string;
  maxFailuresBeforeAlert: number;
  enableSoundNotifications: boolean;
}

const SettingsManagement: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    defaultNotificationDelay: 0,
    enableEmailDigest: true,
    digestFrequency: 'weekly',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    },
    timezone: 'Europe/Moscow',
    maxFailuresBeforeAlert: 3,
    enableSoundNotifications: true
  });
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Загружаем данные пользователя
  const loadProfile = async () => {
    try {
      // Моковые данные - в реальном приложении здесь будет API вызов
      const mockProfile = {
        id: 1,
        email: 'user@example.com',
        firstName: 'Иван',
        lastName: 'Петров',
        createdAt: new Date().toISOString()
      };
      setProfile(mockProfile);
      profileForm.setFieldsValue(mockProfile);
    } catch (error) {
      message.error('Ошибка загрузки профиля');
    }
  };

  useEffect(() => {
    loadProfile();
    settingsForm.setFieldsValue(globalSettings);
  }, []);

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      // В реальном приложении здесь будет API вызов к /profile
      setProfile({ ...profile!, ...values });
      message.success('Профиль успешно обновлен');
    } catch (error) {
      message.error('Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (values: any) => {
    console.log('handleUpdateSettings вызвана с данными:', values);
    setLoading(true);
    try {
      // Имитация сохранения на сервере
      await new Promise(resolve => setTimeout(resolve, 500));
      setGlobalSettings(values);
      console.log('Показываем success message');
      
      // Пробуем разные способы показа уведомления
      message.success('Настройки успешно сохранены');
      message.info('Тестовое уведомление');
      
      // Альтернативный способ
      message.success({
        content: 'Настройки сохранены!',
        duration: 3,
      });
      
    } catch (error) {
      console.error('Ошибка:', error);
      message.error('Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      // В реальном приложении здесь будет API вызов для смены пароля
      message.success('Пароль успешно изменен');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Ошибка смены пароля');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Профиль пользователя */}
      <Card 
        title={
          <Space>
            <UserOutlined />
            <span>Профиль пользователя</span>
          </Space>
        }
      >
        <div className="flex items-center mb-8 p-4">
          <Avatar 
            size={64} 
            style={{ backgroundColor: '#56B3F4' }}
          >
            {getInitials(profile?.firstName, profile?.lastName, profile?.email)}
          </Avatar>
          <div className="ml-8">
            <h3 className="text-lg font-medium text-white mb-2">
              {profile?.firstName && profile?.lastName 
                ? `${profile.firstName} ${profile.lastName}` 
                : profile?.email
              }
            </h3>
            <p className="text-gray-400 mb-1">{profile?.email}</p>
            <p className="text-sm text-gray-500">
              Регистрация: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ru-RU') : '—'}
            </p>
          </div>
        </div>

        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleUpdateProfile}
          disabled={loading}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="firstName"
              label="Имя"
              rules={[{ required: true, message: 'Введите имя' }]}
            >
              <Input placeholder="Введите имя" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Фамилия"
              rules={[{ required: true, message: 'Введите фамилию' }]}
            >
              <Input placeholder="Введите фамилию" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email обязателен' },
              { type: 'email', message: 'Неверный формат email' }
            ]}
          >
            <Input placeholder="email@example.com" disabled />
          </Form.Item>

          <Alert
            message="Информация"
            description="Email нельзя изменить. Для изменения обратитесь в службу поддержки."
            type="info"
            showIcon
            style={{ marginBottom: '48px' }}
          />

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
            >
              Сохранить изменения
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Настройки уведомлений */}
      <Card 
        title={
          <Space>
            <BellOutlined />
            <span>Настройки уведомлений</span>
          </Space>
        }
      >
        <Tabs
          type="card"
          className="alerts-tabs"
          items={[
            {
              key: 'general',
              label: (
                <span>
                  <BellOutlined className="mr-2" />
                  Общие настройки
                </span>
              ),
              children: (
                <Form
                  form={settingsForm}
                  layout="vertical"
                  onFinish={handleUpdateSettings}
                  disabled={loading}
                  initialValues={globalSettings}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      name="defaultNotificationDelay"
                      label={
                        <Space>
                          <span>Задержка уведомлений (минуты)</span>
                          <Tooltip title="Время ожидания перед повторным уведомлением">
                            <InfoCircleOutlined className="text-gray-400" />
                          </Tooltip>
                        </Space>
                      }
                    >
                      <InputNumber 
                        min={0} 
                        max={60} 
                        style={{ width: '100%' }} 
                        placeholder="0 - мгновенно"
                      />
                    </Form.Item>

                    <Form.Item
                      name="maxFailuresBeforeAlert"
                      label="Количество неудачных попыток до алерта"
                    >
                      <InputNumber 
                        min={1} 
                        max={10} 
                        style={{ width: '100%' }} 
                        placeholder="3"
                      />
                    </Form.Item>
                  </div>

                  <Divider orientation="left">Режим "Не беспокоить"</Divider>
                  
                  <Form.Item
                    name={['quietHours', 'enabled']}
                    label="Включить тихие часы"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Включено" unCheckedChildren="Выключено" />
                  </Form.Item>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      name={['quietHours', 'startTime']}
                      label="Начало тихих часов"
                    >
                      <Input type="time" placeholder="22:00" />
                    </Form.Item>

                    <Form.Item
                      name={['quietHours', 'endTime']}
                      label="Окончание тихих часов"
                    >
                      <Input type="time" placeholder="08:00" />
                    </Form.Item>
                  </div>

                  <Divider orientation="left">Email отчеты</Divider>

                  <Form.Item
                    name="enableEmailDigest"
                    label="Получать сводные отчеты на email"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Да" unCheckedChildren="Нет" />
                  </Form.Item>

                  <Form.Item
                    name="digestFrequency"
                    label="Частота отправки отчетов"
                  >
                    <Select>
                      <Option value="daily">Ежедневно</Option>
                      <Option value="weekly">Еженедельно</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="timezone"
                    label="Часовой пояс"
                  >
                    <Select showSearch placeholder="Выберите часовой пояс">
                      <Option value="Europe/Moscow">Europe/Moscow (GMT+3)</Option>
                      <Option value="Europe/London">Europe/London (GMT+0)</Option>
                      <Option value="America/New_York">America/New_York (GMT-5)</Option>
                      <Option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</Option>
                      <Option value="Australia/Sydney">Australia/Sydney (GMT+11)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="enableSoundNotifications"
                    label="Звуковые уведомления в браузере"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Включено" unCheckedChildren="Выключено" />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Сохранить настройки
                    </Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'silencing',
              label: (
                <span>
                  <MutedOutlined className="mr-2" />
                  Сайленсинг
                </span>
              ),
              children: (
                <Suspense fallback={<Loading />}>
                  <SilencingRulesManagement />
                </Suspense>
              )
            }
          ]}
        />
      </Card>

      {/* Безопасность */}
      <Card 
        title={
          <Space>
            <LockOutlined />
            <span>Безопасность</span>
          </Space>
        }
      >
        <div className="space-y-6">
          {/* Смена пароля */}
          <div>
            <h4 className="text-white font-medium mb-4">
              <LockOutlined className="mr-2" />
              Смена пароля
            </h4>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              disabled={loading}
            >
              <Form.Item
                name="currentPassword"
                label="Текущий пароль"
                rules={[{ required: true, message: 'Введите текущий пароль' }]}
              >
                <Password 
                  placeholder="Введите текущий пароль"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="newPassword"
                  label="Новый пароль"
                  rules={[
                    { required: true, message: 'Введите новый пароль' },
                    { min: 6, message: 'Минимум 6 символов' }
                  ]}
                >
                  <Password 
                    placeholder="Минимум 6 символов"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Подтвердите пароль"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Подтвердите новый пароль' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Пароли не совпадают'));
                      },
                    }),
                  ]}
                >
                  <Password 
                    placeholder="Повторите новый пароль"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  danger
                >
                  Изменить пароль
                </Button>
              </Form.Item>
            </Form>
          </div>

          <Divider />

          {/* Информация о безопасности */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-white font-medium mb-3">
              <SecurityScanOutlined className="mr-2" />
              Рекомендации по безопасности
            </h4>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                Используйте сложные пароли с буквами, цифрами и символами
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                Регулярно меняйте пароль (рекомендуется каждые 3 месяца)
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                Не используйте один пароль для разных сервисов
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">!</span>
                Двухфакторная аутентификация будет доступна в следующих версиях
              </li>
            </ul>
          </div>

          <Alert
            message="Активные сеансы"
            description="Функция просмотра активных сеансов находится в разработке"
            type="info"
            showIcon
          />
        </div>
      </Card>
    </div>
  );
};

export default SettingsManagement;
