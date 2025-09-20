import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Table, 
  Modal, 
  Form, 
  Select, 
  TimePicker, 
  Switch, 
  Checkbox, 
  message, 
  Popconfirm,
  Tag,
  Space,
  Alert,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  ScheduleOutlined,
  MailOutlined
} from '@ant-design/icons';
import { getNotificationChannels, type NotificationChannel } from '../../notifications/api/notifications';
// import dayjs from 'dayjs'; // Временно закомментировано до установки пакета

const { Option } = Select;

interface DailyAlert {
  id: number;
  name: string;
  enabled: boolean;
  time: string; // HH:mm format
  channelIds: number[];
  includeStats: boolean;
  includeFailures: boolean;
  includeRecoveries: boolean;
  channels?: NotificationChannel[];
  createdAt: string;
}

// Заглушка для API ежедневных алертов (нужно будет реализовать на бэкенде)
const dailyAlertsAPI = {
  getDailyAlerts: async (): Promise<DailyAlert[]> => {
    // Временная заглушка
    return JSON.parse(localStorage.getItem('dailyAlerts') || '[]');
  },
  
  createDailyAlert: async (data: Omit<DailyAlert, 'id' | 'createdAt'>): Promise<DailyAlert> => {
    const alerts = JSON.parse(localStorage.getItem('dailyAlerts') || '[]');
    const newAlert = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    alerts.push(newAlert);
    localStorage.setItem('dailyAlerts', JSON.stringify(alerts));
    return newAlert;
  },
  
  deleteDailyAlert: async (id: number): Promise<void> => {
    const alerts = JSON.parse(localStorage.getItem('dailyAlerts') || '[]');
    const filtered = alerts.filter((a: DailyAlert) => a.id !== id);
    localStorage.setItem('dailyAlerts', JSON.stringify(filtered));
  },
  
  updateDailyAlert: async (id: number, data: Partial<DailyAlert>): Promise<DailyAlert> => {
    const alerts = JSON.parse(localStorage.getItem('dailyAlerts') || '[]');
    const index = alerts.findIndex((a: DailyAlert) => a.id === id);
    if (index !== -1) {
      alerts[index] = { ...alerts[index], ...data };
      localStorage.setItem('dailyAlerts', JSON.stringify(alerts));
      return alerts[index];
    }
    throw new Error('Alert not found');
  }
};

const DailyAlerts: React.FC = () => {
  const [dailyAlerts, setDailyAlerts] = useState<DailyAlert[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertsData, channelsData] = await Promise.all([
        dailyAlertsAPI.getDailyAlerts(),
        getNotificationChannels()
      ]);
      
      // Обогащаем данные алертов информацией о каналах
      const enrichedAlerts = alertsData.map(alert => ({
        ...alert,
        channels: channelsData.filter(c => alert.channelIds.includes(c.id))
      }));
      
      setDailyAlerts(enrichedAlerts);
      setChannels(channelsData);
    } catch (error) {
      message.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAlert = async (values: any) => {
    try {
      await dailyAlertsAPI.createDailyAlert({
        name: values.name,
        enabled: values.enabled,
        time: values.time, // .format('HH:mm'), - раскомментировать после установки dayjs
        channelIds: values.channelIds,
        includeStats: values.includeStats,
        includeFailures: values.includeFailures,
        includeRecoveries: values.includeRecoveries
      });
      
      message.success('Ежедневный алерт создан успешно');
      setModalVisible(false);
      form.resetFields();
      await loadData();
    } catch (error) {
      message.error('Ошибка создания ежедневного алерта');
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await dailyAlertsAPI.deleteDailyAlert(alertId);
      message.success('Ежедневный алерт удален успешно');
      await loadData();
    } catch (error) {
      message.error('Ошибка удаления ежедневного алерта');
    }
  };

  const handleToggleAlert = async (alertId: number, enabled: boolean) => {
    try {
      await dailyAlertsAPI.updateDailyAlert(alertId, { enabled });
      message.success(`Ежедневный алерт ${enabled ? 'включен' : 'отключен'}`);
      await loadData();
    } catch (error) {
      message.error('Ошибка обновления ежедневного алерта');
    }
  };

  const getChannelTags = (channelsList: NotificationChannel[]) => {
    return channelsList.map(channel => (
      <Tag 
        key={channel.id} 
        color={channel.type === 'telegram' ? 'green' : 'blue'}
        className="mb-1"
      >
        {channel.name}
      </Tag>
    ));
  };

  const getContentTags = (alert: DailyAlert) => {
    const tags = [];
    if (alert.includeStats) tags.push(<Tag key="stats" color="blue">Статистика</Tag>);
    if (alert.includeFailures) tags.push(<Tag key="failures" color="red">Сбои</Tag>);
    if (alert.includeRecoveries) tags.push(<Tag key="recoveries" color="green">Восстановления</Tag>);
    return tags;
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DailyAlert) => (
        <Space>
          <ScheduleOutlined />
          <span className={record.enabled ? 'font-medium' : 'font-medium text-gray-400'}>
            {text}
          </span>
          {!record.enabled && <Tag color="default">Отключен</Tag>}
        </Space>
      ),
    },
    {
      title: 'Время отправки',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => (
        <Tag color="purple" className="font-mono">
          {time}
        </Tag>
      ),
    },
    {
      title: 'Каналы',
      key: 'channels',
      render: (_: any, record: DailyAlert) => (
        <div className="flex flex-wrap gap-1">
          {getChannelTags(record.channels || [])}
        </div>
      ),
    },
    {
      title: 'Содержимое',
      key: 'content',
      render: (_: any, record: DailyAlert) => (
        <div className="flex flex-wrap gap-1">
          {getContentTags(record)}
        </div>
      ),
    },
    {
      title: 'Статус',
      key: 'enabled',
      render: (_: any, record: DailyAlert) => (
        <Switch
          checked={record.enabled}
          onChange={(checked) => handleToggleAlert(record.id, checked)}
          checkedChildren="Вкл"
          unCheckedChildren="Выкл"
        />
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: DailyAlert) => (
        <Popconfirm
          title="Удалить ежедневный алерт?"
          description="Отчеты больше не будут отправляться по расписанию"
          onConfirm={() => handleDeleteAlert(record.id)}
          okText="Да"
          cancelText="Отмена"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            size="small"
          >
            Удалить
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Ежедневные отчеты
          </h3>
          <p className="text-gray-400 text-sm">
            Настройте автоматическую отправку ежедневных отчетов о работе сервисов
          </p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          disabled={channels.length === 0}
        >
          Добавить отчет
        </Button>
      </div>

      {channels.length === 0 && (
        <Alert
          message="Недостаточно данных"
          description="Настройте хотя бы один канал уведомлений для отправки ежедневных отчетов"
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      <Table
        columns={columns}
        dataSource={dailyAlerts}
        loading={loading}
        rowKey="id"
        locale={{ emptyText: 'Нет настроенных ежедневных отчетов' }}
        className="bg-gray-800"
      />

      {/* Модальное окно создания ежедневного алерта */}
      <Modal
        title="Создать ежедневный отчет"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Создать"
        cancelText="Отмена"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAlert}
          initialValues={{
            enabled: true,
            time: '09:00', 
            includeStats: true,
            includeFailures: true,
            includeRecoveries: true
          }}
        >
          <Form.Item
            name="name"
            label="Название отчета"
            rules={[{ required: true, message: 'Введите название отчета' }]}
          >
            <Select placeholder="Выберите название или введите свое">
              <Option value="Ежедневный отчет">Ежедневный отчет</Option>
              <Option value="Утренний дайджест">Утренний дайджест</Option>
              <Option value="Сводка за день">Сводка за день</Option>
              <Option value="Отчет администратора">Отчет администратора</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="time"
            label="Время отправки"
            rules={[{ required: true, message: 'Выберите время' }]}
          >
            <TimePicker 
              format="HH:mm"
              style={{ width: '100%' }}
              placeholder="Выберите время"
            />
          </Form.Item>

          <Form.Item
            name="channelIds"
            label="Каналы для отправки"
            rules={[{ required: true, message: 'Выберите хотя бы один канал' }]}
          >
            <Select 
              mode="multiple"
              placeholder="Выберите каналы"
              style={{ width: '100%' }}
            >
              {channels.map(channel => (
                <Option key={channel.id} value={channel.id}>
                  <Space>
                    <MailOutlined />
                    <span>{channel.name}</span>
                    <Tag color={channel.type === 'telegram' ? 'green' : 'blue'}>
                      {channel.type}
                    </Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">Содержимое отчета</Divider>

          <Form.Item
            name="includeStats"
            valuePropName="checked"
          >
            <Checkbox>Включить общую статистику сервисов</Checkbox>
          </Form.Item>

          <Form.Item
            name="includeFailures"
            valuePropName="checked"
          >
            <Checkbox>Включить информацию о сбоях за день</Checkbox>
          </Form.Item>

          <Form.Item
            name="includeRecoveries"
            valuePropName="checked"
          >
            <Checkbox>Включить информацию о восстановлениях</Checkbox>
          </Form.Item>

          <Form.Item
            name="enabled"
            valuePropName="checked"
          >
            <Checkbox>Активировать отчет сразу после создания</Checkbox>
          </Form.Item>

          <Alert
            message="Информация"
            description="Ежедневные отчеты отправляются в указанное время по локальному времени сервера. Отчет включает статистику за предыдущие 24 часа."
            type="info"
            showIcon
            className="mt-4"
          />
        </Form>
      </Modal>
    </div>
  );
};

export default DailyAlerts;
