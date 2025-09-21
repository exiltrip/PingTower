import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  Modal, 
  message, 
  Space, 
  Tag
} from 'antd';
import dayjs from 'dayjs';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined 
} from '@ant-design/icons';
import { getSilencingRules, createSilencingRule, updateSilencingRule, deleteSilencingRule } from '../api';
import type { SilencingRule, CreateSilencingRuleRequest } from '../../../entities/silencing/types';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const SilencingRulesSimple: React.FC = () => {
  const [rules, setRules] = useState<SilencingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<SilencingRule | null>(null);
  const [notifyOnStart, setNotifyOnStart] = useState(false);
  const [notifyOnEnd, setNotifyOnEnd] = useState(false);
  const [form] = Form.useForm();

  const loadRules = async () => {
    setLoading(true);
    try {
      console.log('Загружаем правила сайленсинга...');
      const data = await getSilencingRules();
      console.log('Получены правила:', data);
      setRules(data);
    } catch (error: any) {
      console.error('Ошибка загрузки правил:', error);
      console.error('Ответ сервера:', error.response?.data);
      console.error('Статус:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          (Array.isArray(error.response?.data?.message) ? 
                           error.response.data.message.join(', ') : 
                           error.message || 'Ошибка загрузки правил');
      
      message.error(`Ошибка загрузки: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      const [startTime, endTime] = values.timeRange;
      
      if (editingRule) {
        // Для обновления не отправляем userId и isActive
        const updateData = {
          name: values.name,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          silenceType: values.silenceType || 'maintenance',
          config: {
            description: values.description,
            notifyOnStart: notifyOnStart,
            notifyOnEnd: notifyOnEnd
          }
        };
        
        console.log('Обновляем правило с ID:', editingRule.id);
        console.log('Данные для обновления:', updateData);
        await updateSilencingRule(editingRule.id, updateData);
        message.success('Правило обновлено');
      } else {
        // Для создания отправляем все данные
        const createData: CreateSilencingRuleRequest = {
          name: values.name,
          userId: 1, // Текущий пользователь
          isActive: true,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          silenceType: values.silenceType || 'maintenance',
          config: {
            description: values.description,
            notifyOnStart: notifyOnStart,
            notifyOnEnd: notifyOnEnd
          }
        };
        
        console.log('Создаем новое правило:', createData);
        await createSilencingRule(createData);
        message.success('Правило создано');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingRule(null);
      setNotifyOnStart(false);
      setNotifyOnEnd(false);
      loadRules();
    } catch (error: any) {
      console.error('Полная ошибка:', error);
      console.error('Ответ сервера:', error.response?.data);
      console.error('Статус:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          (Array.isArray(error.response?.data?.message) ? 
                           error.response.data.message.join(', ') : 
                           error.message || 'Ошибка сохранения правила');
      
      message.error(`Ошибка: ${errorMessage}`);
    }
  };

  const handleEdit = (rule: SilencingRule) => {
    setEditingRule(rule);
    setNotifyOnStart(rule.config?.notifyOnStart || false);
    setNotifyOnEnd(rule.config?.notifyOnEnd || false);
    form.setFieldsValue({
      name: rule.name,
      silenceType: rule.silenceType,
      timeRange: [dayjs(rule.startTime), dayjs(rule.endTime)],
      description: rule.config?.description
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSilencingRule(id);
      message.success('Правило удалено');
      loadRules();
    } catch (error) {
      message.error('Ошибка удаления');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Тип',
      dataIndex: 'silenceType',
      key: 'silenceType',
      render: (type: string) => {
        const colors: Record<string, string> = {
          maintenance: 'blue',
          temporary: 'orange',
          scheduled: 'green'
        };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
      }
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Активно' : 'Неактивно'}
        </Tag>
      )
    },
    {
      title: 'Период',
      key: 'period',
      render: (_: any, record: SilencingRule) => (
        <div>
          <div>С: {new Date(record.startTime).toLocaleString()}</div>
          <div>До: {new Date(record.endTime).toLocaleString()}</div>
        </div>
      )
    },
    {
      title: 'Описание',
      key: 'description',
      render: (_: any, record: SilencingRule) => (
        record.config?.description || '—'
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: SilencingRule) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Изменить
          </Button>
          <Button 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Удалить
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Правила сайленсинга</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Создать правило
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rules}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: 'Нет правил сайленсинга' }}
      />

      <Modal
        title={editingRule ? "Редактировать правило сайленсинга" : "Создать правило сайленсинга"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRule(null);
          setNotifyOnStart(false);
          setNotifyOnEnd(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Например: Техническое обслуживание" />
          </Form.Item>

          <Form.Item
            name="silenceType"
            label="Тип сайленсинга"
            initialValue="maintenance"
          >
            <Select>
              <Select.Option value="maintenance">Техническое обслуживание</Select.Option>
              <Select.Option value="temporary">Временное</Select.Option>
              <Select.Option value="scheduled">Запланированное</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Период действия"
            rules={[{ required: true, message: 'Выберите период' }]}
          >
            <RangePicker
              showTime
              format="DD.MM.YYYY HH:mm"
              placeholder={['Начало', 'Конец']}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
          >
            <TextArea 
              rows={3}
              placeholder="Описание причины сайленсинга..."
            />
          </Form.Item>

          <div className="flex gap-3 mt-4">
            <Button 
              type={notifyOnStart ? "primary" : "default"}
              onClick={() => setNotifyOnStart(!notifyOnStart)}
              className={notifyOnStart ? "bg-blue-500 border-blue-500" : ""}
            >
              🔔 Уведомить о начале
            </Button>
            <Button 
              type={notifyOnEnd ? "primary" : "default"}
              onClick={() => setNotifyOnEnd(!notifyOnEnd)}
              className={notifyOnEnd ? "bg-blue-500 border-blue-500" : ""}
            >
              📢 Уведомить об окончании
            </Button>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setModalVisible(false)}>
              Отмена
            </Button>
            <Button type="primary" htmlType="submit">
              {editingRule ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SilencingRulesSimple;
