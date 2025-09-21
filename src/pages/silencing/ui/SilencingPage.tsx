import React, { Suspense } from 'react';
import { Card } from 'antd';
import { MutedOutlined } from '@ant-design/icons';
import Loading from '@/shared/ui/Loading';

// Lazy load для избежания проблем с импортами
const SilencingRulesManagement = React.lazy(() => import('@/features/silencing/ui/SilencingRulesManagement'));

const SilencingPage: React.FC = () => {
  return (
    <div className="p-6">
      <Card 
        className="bg-gray-800 border-gray-700" 
        title={
          <div className="flex items-center gap-2">
            <span>Управление сайленсингом</span>
          </div>
        }
      >
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-4">
            Настройте правила временного отключения уведомлений для технических работ и обслуживания
          </p>
        </div>
        
        <Suspense fallback={<Loading />}>
          <SilencingRulesManagement />
        </Suspense>
      </Card>
    </div>
  );
};

export default SilencingPage;
