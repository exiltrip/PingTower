import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Table, 
  Modal, 
  Form, 
  Select, 
  Switch, 
  InputNumber, 
  message, 
  Popconfirm,
  Tag,
  Space,
  Divider,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { 
  createAlertRule,
  getAlertRules
} from '../../checks/api/checks';
import { 
  getNotificationChannels,
  type NotificationChannel 
} from '../../notifications/api/notifications';
import { getAllChecks } from '../../checks/api/checks';

const { Option } = Select;

interface Check {
  id: number;
  name: string;
  target: string;
  type: string;
  enabled: boolean;
}

interface AlertRule {
  id: number;
  checkId: number;
  channelId: number;
  config: {
    notify_on_recovery?: boolean;
    notify_after_failures?: number;
  };
  notifyOnRecovery: boolean;
  notifyAfterFailures: number;
  createdAt: string;
  updatedAt: string;
  check?: Check;
  channel?: NotificationChannel;
}

const AlertRulesManagement: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [checks, setChecks] = useState<Check[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [checksData, channelsData] = await Promise.all([
        getAllChecks({ limit: 1000 }),
        getNotificationChannels()
      ]);
      
      setChecks(checksData || []);
      setChannels(channelsData);

      // Загружаем правила алертов для всех чеков
      const allRules: AlertRule[] = [];
      for (const check of checksData || []) {
        try {
          const rules = await getAlertRules(check.id);
          const rulesWithMeta = rules.map((rule: any) => ({
            ...rule,
            check,
            channel: channelsData.find((c: NotificationChannel) => c.id === rule.channelId)
          }));
          allRules.push(...rulesWithMeta);
        } catch (error) {
          // Игнорируем ошибки для отдельных чеков
        }
      }
      setAlertRules(allRules);
    } catch (error) {
      message.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRule = async (values: any) => {
    try {
      await createAlertRule(values.checkId, {
        channel_id: values.channelId,
        config: {
          notify_on_recovery: values.notifyOnRecovery,
          notify_after_failures: values.notifyAfterFailures
        }
      });
      
      message.success('Правило алерта создано успешно');
      setModalVisible(false);
      form.resetFields();
      await loadData();
    } catch (error) {
      message.error('Ошибка создания правила алерта');
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      // API endpoint для удаления правила
      await fetch(`/api/v1/alert-rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      message.success('Правило алерта удалено успешно');
      await loadData();
    } catch (error) {
      message.error('Ошибка удаления правила алерта');
    }
  };

  const getCheckTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      'httpCheck': { color: 'blue', text: 'HTTP' },
      'pingCheck': { color: 'green', text: 'Ping' },
      'multiStatusHttp': { color: 'purple', text: 'Multi HTTP' },
      'highPerfPing': { color: 'orange', text: 'High Perf Ping' }
    };
    
    const config = typeMap[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getChannelTypeTag = (type: string) => {
    switch (type) {
      case 'webhook':
        return <Tag color="blue">Webhook</Tag>;
      case 'telegram':
        return <Tag color="green">Telegram</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Чек',
      key: 'check',
      render: (_: any, record: AlertRule) => (
        <Space direction="vertical" size={0}>
          <Space>
            <BellOutlined />
            <span className="font-medium">{record.check?.name}</span>
          </Space>
          <div className="text-xs text-gray-400">
            {getCheckTypeTag(record.check?.type || '')}
            <span className="ml-2">{record.check?.target}</span>
          </div>
        </Space>
      ),
    },
    {
      title: 'Канал',
      key: 'channel',
      render: (_: any, record: AlertRule) => (
        <Space direction="vertical" size={0}>
          <span>{record.channel?.name}</span>
          <div className="text-xs">
            {getChannelTypeTag(record.channel?.type || '')}
          </div>
        </Space>
      ),
    },
    {
      title: 'Настройки',
      key: 'config',
      render: (_: any, record: AlertRule) => (
        <Space direction="vertical" size={0}>
          <div className="flex items-center">
            {record.notifyOnRecovery ? (
              <CheckCircleOutlined className="text-green-500 mr-1" />
            ) : (
              <ExclamationCircleOutlined className="text-gray-400 mr-1" />
            )}
            <span className="text-xs">
              {record.notifyOnRecovery ? 'Уведомлять о восстановлении' : 'Не уведомлять о восстановлении'}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Алерт после {record.notifyAfterFailures} неудачных попыток
          </div>
        </Space>
      ),
    },
    {
      title: 'Создано',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: AlertRule) => (
        <Popconfirm
          title="Удалить правило?"
          description="Уведомления по этому правилу больше не будут отправляться"
          onConfirm={() => handleDeleteRule(record.id)}
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
            Правила алертов
          </h3>
          <p className="text-gray-400 text-sm">
            Настройте когда и как отправлять уведомления о сбоях
          </p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          disabled={checks.length === 0 || channels.length === 0}
        >
          Добавить правило
        </Button>
      </div>

      {(checks.length === 0 || channels.length === 0) && (
        <Alert
          message="Недостаточно данных"
          description={
            <div>
              {checks.length === 0 && <div>• Создайте хотя бы один чек для мониторинга</div>}
              {channels.length === 0 && <div>• Настройте хотя бы один канал уведомлений</div>}
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      <Table
        columns={columns}
        dataSource={alertRules}
        loading={loading}
        rowKey="id"
        locale={{ emptyText: 'Нет настроенных правил алертов' }}
      />

      {/* Модальное окно создания правила */}
      <Modal
        title="Создать правило алерта"
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
          onFinish={handleCreateRule}
          initialValues={{
            notifyOnRecovery: true,
            notifyAfterFailures: 1
          }}
        >
          <Form.Item
            name="checkId"
            label="Выберите чек для мониторинга"
            rules={[{ required: true, message: 'Выберите чек' }]}
          >
            <Select 
              placeholder="Выберите чек"
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {checks.map(check => (
                <Option key={check.id} value={check.id}>
                  <Space>
                    <span>{check.name}</span>
                    {getCheckTypeTag(check.type)}
                    <span className="text-gray-400 text-xs">({check.target})</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="channelId"
            label="Канал уведомлений"
            rules={[{ required: true, message: 'Выберите канал' }]}
          >
            <Select placeholder="Выберите канал">
              {channels.map(channel => (
                <Option key={channel.id} value={channel.id}>
                  <Space>
                    <span>{channel.name}</span>
                    {getChannelTypeTag(channel.type)}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">Настройки уведомлений</Divider>

          <Form.Item
            name="notifyAfterFailures"
            label="Количество неудачных попыток до алерта"
            rules={[{ required: true }]}
          >
            <InputNumber 
              min={1} 
              max={10}
              style={{ width: '100%' }}
              placeholder="1"
            />
          </Form.Item>

          <Form.Item
            name="notifyOnRecovery"
            label="Уведомлять о восстановлении сервиса"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Alert
            message="Информация"
            description="Правило будет срабатывать только для активных чеков. Если чек отключен, уведомления отправляться не будут."
            type="info"
            showIcon
            className="mt-4"
          />
        </Form>
      </Modal>
    </div>
  );
};

export default AlertRulesManagement;
