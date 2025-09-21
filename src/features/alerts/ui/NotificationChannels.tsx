import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm,
  Tag,
  Space,
  Alert,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  LinkOutlined, 
  MailOutlined,
  SendOutlined
} from '@ant-design/icons';
import { 
  getNotificationChannels,
  createWebhookChannel,
  createTelegramChannel,
  deleteNotificationChannel,
  generateTelegramLinkingCode,
  type NotificationChannel
} from '../../notifications/api/notifications';
import {useNotifier} from "@/hooks/useSnackbar.ts";

const { Option } = Select;
const { Text } = Typography;

const NotificationChannels: React.FC = () => {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [telegramLinkingVisible, setTelegramLinkingVisible] = useState(false);
  const [linkingCode, setLinkingCode] = useState<string>('');
  const [form] = Form.useForm();
  const { notify } = useNotifier();

  const loadChannels = async () => {
    setLoading(true);
    try {
      const data = await getNotificationChannels();
      setChannels(data);
    } catch (error) {
      message.error('Ошибка загрузки каналов уведомлений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const handleCreateChannel = async (values: any) => {
    try {
      if (values.type === 'webhook') {
        await createWebhookChannel(values.name, values.url);
        message.success('Webhook канал создан успешно');
      } else if (values.type === 'telegram') {
        // Для Telegram сначала показываем процесс привязки
        const response = await generateTelegramLinkingCode();
        setLinkingCode(response.linking_code);
        setTelegramLinkingVisible(true);
        setModalVisible(false);
        return;
      }
      
      setModalVisible(false);
      form.resetFields();
      await loadChannels();
    } catch (error) {
      message.error('Ошибка создания канала');
    }
  };

  const handleDeleteChannel = async (channelId: number) => {
    try {
      await deleteNotificationChannel(channelId);
      message.success('Канал удален успешно');
      await loadChannels();
    } catch (error) {
      message.error('Ошибка удаления канала');
    }
  };

  const handleTelegramLinking = async () => {
    try {
      const name = form.getFieldValue('name');
      await createTelegramChannel(name);
      message.success('Telegram канал создан успешно');
      setTelegramLinkingVisible(false);
      form.resetFields();
      await loadChannels();
    } catch (error) {
      message.error('Ошибка создания Telegram канала');
    }
  };

  const getChannelTypeTag = (type: string) => {
    switch (type) {
      case 'webhook':
        return <Tag color="blue" icon={<LinkOutlined />}>Webhook</Tag>;
      case 'telegram':
        return <Tag color="green" icon={<SendOutlined />}>Telegram</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, _record: NotificationChannel) => (
        <Space>
          <MailOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getChannelTypeTag(type),
    },
    {
      title: 'Конфигурация',
      dataIndex: 'config',
      key: 'config',
      render: (config: Record<string, any>, record: NotificationChannel) => {
        if (record.type === 'webhook') {
          return <Text code>{config.url}</Text>;
        } else if (record.type === 'telegram') {
          return <Text type="secondary">Привязан к Telegram</Text>;
        }
        return '-';
      },
    },
    {
      title: 'Создан',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: NotificationChannel) => (
        <Popconfirm
          title="Удалить канал?"
          description="Это также удалит все связанные правила алертов"
          onConfirm={() => handleDeleteChannel(record.id)}
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
            Каналы уведомлений
          </h3>
          <p className="text-gray-400 text-sm">
            Настройте каналы для получения уведомлений об алертах
          </p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Добавить канал
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={channels}
        loading={loading}
        rowKey="id"
        locale={{ emptyText: 'Нет настроенных каналов' }}

      />

      {/* Модальное окно создания канала */}
      <Modal
        title="Создать канал уведомлений"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateChannel}
        >
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название канала' }]}
          >
            <Input placeholder="Например: Slack уведомления" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Тип канала"
            rules={[{ required: true, message: 'Выберите тип канала' }]}
          >
            <Select placeholder="Выберите тип">
              <Option value="webhook">Webhook (Slack, Discord, и др.)</Option>
              <Option value="telegram">Telegram Bot</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              
              if (type === 'webhook') {
                return (
                  <Form.Item
                    name="url"
                    label="Webhook URL"
                    rules={[
                      { required: true, message: 'Введите URL webhook' },
                      { type: 'url', message: 'Введите корректный URL' }
                    ]}
                  >
                    <Input placeholder="https://hooks.slack.com/services/..." />
                  </Form.Item>
                );
              }

              if (type === 'telegram') {
                return (
                  <Alert
                    message="Telegram Bot"
                    description="После создания канала вам будет предоставлен код для привязки к боту"
                    type="info"
                    showIcon
                  />
                );
              }

              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно привязки Telegram */}
      <Modal
        title="Привязка Telegram канала"
        open={telegramLinkingVisible}
        onCancel={() => setTelegramLinkingVisible(false)}
        onOk={handleTelegramLinking}
        okText="Канал создан"
        cancelText="Отмена"
      >
        <div className="text-center">
          <Alert
            message="Отправьте код боту"
            description={
              <div>
                <p>Отправьте следующий код нашему Telegram боту:</p>
                <div onClick={() => {
                  navigator.clipboard.writeText(linkingCode);
                  notify("Успешно скопировано!", "success");

                }} className="my-4 cursor-pointer p-4 bg-gray-100 text-gray-950 rounded text-2xl font-mono">
                  {linkingCode}
                </div>
                <p className="text-sm text-gray-600">
                  Код действителен в течение 5 минут. После отправки кода боту, нажмите "Канал создан".
                </p>
              </div>
            }
            type="info"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
};

export default NotificationChannels;
