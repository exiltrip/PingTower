import React, { useState, Suspense } from 'react';
import { Card, Tabs } from 'antd';
import { MailOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';
import Loading from '@/shared/ui/Loading';

// Lazy load компонентов для избежания проблем с импортами
const NotificationChannels = React.lazy(() => import('@/features/alerts/ui/NotificationChannels'));
const AlertRulesManagement = React.lazy(() => import('@/features/alerts/ui/AlertRulesManagement'));
const DailyAlerts = React.lazy(() => import('@/features/alerts/ui/DailyAlerts'));

const { TabPane } = Tabs;

const AlertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('channels');

  const tabs = [
    {
      key: 'channels',
      label: (
        <span>
          <MailOutlined className="mr-2" />
          Каналы уведомлений
        </span>
      ),
      content: (
        <Suspense fallback={<Loading />}>
          <NotificationChannels />
        </Suspense>
      )
    },
    {
      key: 'rules',
      label: (
        <span>
          <BellOutlined className="mr-2" />
          Правила алертов
        </span>
      ),
      content: (
        <Suspense fallback={<Loading />}>
          <AlertRulesManagement />
        </Suspense>
      )
    },
    {
      key: 'daily',
      label: (
        <span>
          <SettingOutlined className="mr-2" />
          Ежедневные отчеты
        </span>
      ),
      content: (
        <Suspense fallback={<Loading />}>
          <DailyAlerts />
        </Suspense>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card className="bg-gray-800 border-gray-700" title="Управление уведомлениями">
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-4">
            Настройте каналы уведомлений, правила алертов и ежедневные отчеты
          </p>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          className="alerts-tabs"
        >
          {tabs.map(tab => (
            <TabPane tab={tab.label} key={tab.key}>
              <div className="mt-4">
                {tab.content}
              </div>
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default AlertsPage;
