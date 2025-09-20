import React, { useState, useEffect } from 'react';
import { Card, Avatar, Space, Descriptions, Tag, Statistic, Row, Col, Button } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

interface UserStats {
  totalChecks: number;
  activeChecks: number;
  alertRules: number;
  lastLoginAt: string;
  uptime30Days: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // В реальном приложении здесь будет API вызов к /profile
        const mockProfile: UserProfile = {
          id: 1,
          email: 'user@example.com',
          firstName: 'Иван',
          lastName: 'Петров',
          createdAt: '2024-01-15T10:30:00Z'
        };

        const mockStats: UserStats = {
          totalChecks: 12,
          activeChecks: 10,
          alertRules: 8,
          lastLoginAt: new Date().toISOString(),
          uptime30Days: 98.5
        };

        setProfile(mockProfile);
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'green';
    if (uptime >= 95) return 'orange';
    return 'red';
  };

  if (loading) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок профиля */}
      <Card>
        <div className="flex items-center mb-6">
          <Avatar 
            size={80} 
            style={{ backgroundColor: '#56B3F4' }}
          >
            {getInitials(profile?.firstName, profile?.lastName, profile?.email)}
          </Avatar>
          <div className="flex-1 ml-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {profile?.firstName && profile?.lastName 
                ? `${profile.firstName} ${profile.lastName}` 
                : profile?.email
              }
            </h2>
            <Space size="large">
              <Space>
                <MailOutlined className="text-gray-400" />
                <span className="text-gray-300">{profile?.email}</span>
              </Space>
              <Space>
                <CalendarOutlined className="text-gray-400" />
                <span className="text-gray-300">
                  С нами с {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ru-RU') : '—'}
                </span>
              </Space>
            </Space>
          </div>
          <Button 
            type="primary" 
            icon={<SettingOutlined />}
            onClick={() => navigate('/settings')}
          >
            Редактировать профиль
          </Button>
        </div>
      </Card>

      {/* Статистика */}
      <Card title="Статистика аккаунта">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Всего проверок"
              value={stats?.totalChecks || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Активных проверок"
              value={stats?.activeChecks || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#1890ff' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Правил уведомлений"
              value={stats?.alertRules || 0}
              prefix={<MailOutlined style={{ color: '#722ed1' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Аптайм за 30 дней"
              value={stats?.uptime30Days || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: getUptimeColor(stats?.uptime30Days || 0) }}
            />
          </Col>
        </Row>
      </Card>

      {/* Детальная информация */}
      <Card title="Информация об аккаунте">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="ID пользователя">
            #{profile?.id}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {profile?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Имя">
            {profile?.firstName || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Фамилия">
            {profile?.lastName || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Дата регистрации">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleString('ru-RU') : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Последний вход">
            <Space>
              <ClockCircleOutlined />
              {stats?.lastLoginAt ? new Date(stats.lastLoginAt).toLocaleString('ru-RU') : '—'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Статус аккаунта">
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Активен
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Быстрые действия */}
      <Card title="Быстрые действия">
        <Space size="middle" wrap>
          <Button type="primary" onClick={() => navigate('/settings')}>
            Настройки профиля
          </Button>
          <Button onClick={() => navigate('/alerts')}>
            Управление уведомлениями
          </Button>
          <Button onClick={() => navigate('/')}>
            Посмотреть статистику
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default ProfilePage;
