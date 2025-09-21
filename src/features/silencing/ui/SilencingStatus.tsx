import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Spin } from 'antd';
import { MutedOutlined, SoundOutlined } from '@ant-design/icons';
import { getCheckSilencingStatus } from '../api';
import type { SilencingStatus as SilencingStatusType } from '../../../entities/silencing/types';

interface SilencingStatusProps {
  checkId: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // в миллисекундах
}

const SilencingStatus: React.FC<SilencingStatusProps> = ({
  checkId,
  autoRefresh = false,
  refreshInterval = 30000 // 30 секунд
}) => {
  const [status, setStatus] = useState<SilencingStatusType | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const silencingStatus = await getCheckSilencingStatus(checkId);
      setStatus(silencingStatus);
    } catch (error) {
      console.error('Error loading silencing status:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [checkId, autoRefresh, refreshInterval]);

  if (loading) {
    return <Spin size="small" />;
  }

  if (!status) {
    return null;
  }

  const getSilencingTooltip = () => {
    if (!status.isSilenced) {
      return "Уведомления активны";
    }

    const activeRules = status.activeSilencingRules;
    if (activeRules.length === 0) {
      return "Чек заглушен";
    }

    const tooltipLines = [
      "Чек заглушен правилами:",
      ...activeRules.map(rule => {
        const endsAt = new Date(rule.endsAt);
        const now = new Date();
        const timeLeft = Math.floor((endsAt.getTime() - now.getTime()) / (1000 * 60));
        
        if (timeLeft > 60) {
          const hours = Math.floor(timeLeft / 60);
          const minutes = timeLeft % 60;
          return `• ${rule.name} (${hours}ч ${minutes}м)`;
        } else {
          return `• ${rule.name} (${timeLeft}м)`;
        }
      })
    ];

    return tooltipLines.join('\n');
  };

  return (
    <Tooltip title={getSilencingTooltip()} placement="top">
      <Badge 
        dot={status.isSilenced}
        color={status.isSilenced ? 'orange' : 'transparent'}
      >
        {status.isSilenced ? (
          <MutedOutlined 
            className="text-orange-400" 
            style={{ fontSize: '14px' }} 
          />
        ) : (
          <SoundOutlined 
            className="text-gray-400" 
            style={{ fontSize: '14px' }} 
          />
        )}
      </Badge>
    </Tooltip>
  );
};

export default SilencingStatus;
